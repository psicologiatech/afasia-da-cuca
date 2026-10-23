import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Listar todas as categorias (incluindo subcategorias e itens)
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { parentId: null }, // Categorias principais
      include: {
        subs: {
          include: {
            itens: true,
          },
        },
        itens: true,
      },
      orderBy: { ordem: "asc" },
    });

    return NextResponse.json({ ok: true, categorias });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { ok: false, erro: "Erro ao buscar categorias: " + mensagem },
      { status: 500 }
    );
  }
}

// Criar nova categoria ou subcategoria
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, icone, parentId } = body;

    const nomeFormatado = String(nome || "").trim();
    if (!nomeFormatado) {
      return NextResponse.json(
        { ok: false, erro: "O nome da categoria é obrigatório." },
        { status: 400 }
      );
    }

    const novaCategoria = await prisma.categoria.create({
      data: {
        nome: nomeFormatado,
        icone: icone ? String(icone).trim() : null,
        parentId: parentId ? String(parentId).trim() : null,
      },
    });

    return NextResponse.json({ ok: true, categoria: novaCategoria });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { ok: false, erro: "Erro ao criar categoria: " + mensagem },
      { status: 500 }
    );
  }
}

// Excluir categoria ou subcategoria
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, erro: "ID da categoria não informado." },
        { status: 400 }
      );
    }

    await prisma.categoria.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true, mensagem: "Categoria removida com sucesso!" });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { ok: false, erro: "Erro ao remover categoria: " + mensagem },
      { status: 500 }
    );
  }
}
