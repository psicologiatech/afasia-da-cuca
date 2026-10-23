import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Adicionar novo item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, imagem, categoriaId } = body;

    const nomeFormatado = String(nome || "").trim();
    const imagemFormatada = String(imagem || "📌").trim();

    if (!nomeFormatado) {
      return NextResponse.json(
        { ok: false, erro: "O nome do item é obrigatório." },
        { status: 400 }
      );
    }

    if (!categoriaId) {
      return NextResponse.json(
        { ok: false, erro: "A categoria do item é obrigatória." },
        { status: 400 }
      );
    }

    const novoItem = await prisma.item.create({
      data: {
        nome: nomeFormatado,
        imagem: imagemFormatada,
        categoriaId: String(categoriaId),
      },
    });

    return NextResponse.json({ ok: true, item: novoItem });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { ok: false, erro: "Erro ao adicionar item: " + mensagem },
      { status: 500 }
    );
  }
}

// Remover item existente
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, erro: "ID do item não informado." },
        { status: 400 }
      );
    }

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true, mensagem: "Item removido com sucesso!" });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { ok: false, erro: "Erro ao remover item: " + mensagem },
      { status: 500 }
    );
  }
}
