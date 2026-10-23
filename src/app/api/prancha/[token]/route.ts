import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buscarPrancha, erro, limparDados, pinConfere, pinDoPedido, TAMANHO_MAX_DADOS } from "@/lib/prancha-servidor";

export const dynamic = "force-dynamic";

type Contexto = { params: { token: string } };

// Lê a prancha. Quem tem o link (token) pode ler; com o cabeçalho x-pin, informa se pode editar.
export async function GET(req: NextRequest, { params }: Contexto) {
  const prancha = await buscarPrancha(params.token);
  if (!prancha) return erro("Prancha não encontrada. Confira o link.", 404);
  const pin = pinDoPedido(req);
  return NextResponse.json(
    {
      ok: true,
      nome: prancha.nome,
      versao: prancha.versao,
      dados: prancha.dados,
      podeEditar: pin ? pinConfere(pin, prancha.pinHash) : undefined,
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

// Salva a prancha inteira. Exige o PIN do modo família.
export async function PUT(req: NextRequest, { params }: Contexto) {
  const prancha = await buscarPrancha(params.token);
  if (!prancha) return erro("Prancha não encontrada.", 404);
  if (!pinConfere(pinDoPedido(req), prancha.pinHash)) return erro("PIN incorreto.", 401);

  const texto = await req.text();
  if (texto.length > TAMANHO_MAX_DADOS) return erro("Os dados passaram do tamanho permitido.", 413);
  let corpo: { dados?: { versao?: number; telas?: unknown[] } };
  try { corpo = JSON.parse(texto); } catch { return erro("Dados inválidos.", 400); }
  if (!corpo.dados || corpo.dados.versao !== 1 || !Array.isArray(corpo.dados.telas)) return erro("Dados inválidos.", 400);

  const atualizada = await prisma.prancha.update({
    where: { id: prancha.id },
    data: { dados: limparDados(corpo.dados) as Prisma.InputJsonValue, versao: { increment: 1 } },
  });
  return NextResponse.json({ ok: true, versao: atualizada.versao });
}
