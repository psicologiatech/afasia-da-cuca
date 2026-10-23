import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirCodigo } from "@/lib/autorizacao";
import { erro, hashPin, novoToken, pinValido } from "@/lib/prancha-servidor";
import { CONTEUDO_INICIAL } from "@/components/Prancha/conteudoInicial";

export const dynamic = "force-dynamic";

// Cria a prancha de uma família. Só a equipe (CODIGO_ACESSO) pode criar.
export async function POST(req: NextRequest) {
  const negado = exigirCodigo(req);
  if (negado) return negado;
  try {
    const { nome, pin } = await req.json();
    const nomeOk = String(nome || "").trim().slice(0, 80);
    if (!nomeOk) return erro("Dê um nome para a prancha.", 400);
    if (!pinValido(pin)) return erro("O PIN precisa ter de 6 a 10 números.", 400);

    const prancha = await prisma.prancha.create({
      data: {
        nome: nomeOk,
        token: novoToken(),
        pinHash: hashPin(pin),
        dados: JSON.parse(JSON.stringify(CONTEUDO_INICIAL)),
      },
    });
    return NextResponse.json({ ok: true, token: prancha.token, nome: prancha.nome });
  } catch (e) {
    return erro("Não foi possível criar a prancha: " + (e instanceof Error ? e.message : "erro desconhecido"), 500);
  }
}
