import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { del, get, put } from "@vercel/blob";
import { buscarPrancha, erro, pinConfere, pinDoPedido, prefixoFotos } from "@/lib/prancha-servidor";

export const dynamic = "force-dynamic";

type Contexto = { params: { token: string } };
const TAMANHO_MAX_FOTO = 2_000_000; // as fotos chegam já reduzidas (640 px)

// Entrega uma foto do Blob privado, só para quem tem o link desta prancha.
export async function GET(req: NextRequest, { params }: Contexto) {
  const prancha = await buscarPrancha(params.token);
  if (!prancha) return erro("Prancha não encontrada.", 404);
  const caminho = req.nextUrl.searchParams.get("p") || "";
  if (!caminho.startsWith(prefixoFotos(prancha.id)) || caminho.includes("..")) return erro("Foto não encontrada.", 404);

  const resultado = await get(caminho, { access: "private", ifNoneMatch: req.headers.get("if-none-match") ?? undefined });
  if (!resultado) return erro("Foto não encontrada.", 404);
  if (resultado.statusCode === 304) {
    return new NextResponse(null, { status: 304, headers: { ETag: resultado.blob.etag, "Cache-Control": "private, no-cache" } });
  }
  return new NextResponse(resultado.stream, {
    headers: {
      "Content-Type": resultado.blob.contentType,
      "X-Content-Type-Options": "nosniff",
      ETag: resultado.blob.etag,
      "Cache-Control": "private, no-cache",
    },
  });
}

// Recebe uma foto (JPEG) do modo família e guarda no Blob privado. Exige PIN.
export async function POST(req: NextRequest, { params }: Contexto) {
  const prancha = await buscarPrancha(params.token);
  if (!prancha) return erro("Prancha não encontrada.", 404);
  if (!pinConfere(pinDoPedido(req), prancha.pinHash)) return erro("PIN incorreto.", 401);
  if (req.headers.get("content-type") !== "image/jpeg") return erro("Envie a foto em JPEG.", 415);

  const corpo = await req.arrayBuffer();
  if (corpo.byteLength === 0 || corpo.byteLength > TAMANHO_MAX_FOTO) return erro("Foto vazia ou grande demais.", 413);

  const caminho = `${prefixoFotos(prancha.id)}${randomUUID()}.jpg`;
  const blob = await put(caminho, Buffer.from(corpo), {
    access: "private",
    contentType: "image/jpeg",
    addRandomSuffix: false,
  });
  return NextResponse.json({ ok: true, caminho: blob.pathname });
}

// Apaga uma foto que deixou de ser usada. Exige PIN.
export async function DELETE(req: NextRequest, { params }: Contexto) {
  const prancha = await buscarPrancha(params.token);
  if (!prancha) return erro("Prancha não encontrada.", 404);
  if (!pinConfere(pinDoPedido(req), prancha.pinHash)) return erro("PIN incorreto.", 401);
  const caminho = req.nextUrl.searchParams.get("p") || "";
  if (!caminho.startsWith(prefixoFotos(prancha.id)) || caminho.includes("..")) return erro("Foto não encontrada.", 404);
  try {
    await del(caminho);
  } catch {
    // já apagada: tudo bem
  }
  return NextResponse.json({ ok: true });
}
