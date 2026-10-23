import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Criação de novos convites para famílias (somente com o código de acesso da equipe)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { codigo, familia } = body;

    const codigoConfigurado = process.env.CODIGO_ACESSO;

    if (!codigoConfigurado) {
      return NextResponse.json(
        { ok: false, erro: "O CODIGO_ACESSO não foi configurado nas variáveis de ambiente." },
        { status: 500 }
      );
    }

    if (codigo !== codigoConfigurado) {
      return NextResponse.json(
        { ok: false, erro: "Código de acesso incorreto." },
        { status: 401 }
      );
    }

    const nomeFamilia = String(familia || "").trim();
    if (!nomeFamilia) {
      return NextResponse.json(
        { ok: false, erro: "Informe um nome ou apelido para a família." },
        { status: 400 }
      );
    }

    // Gera um token único de 16 caracteres hexadecimais
    const token = crypto.randomBytes(8).toString("hex");

    const novaFamilia = await prisma.familia.create({
      data: {
        token,
        nome: nomeFamilia,
      },
    });

    return NextResponse.json({
      ok: true,
      token: novaFamilia.token,
      familia: novaFamilia.nome,
    });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { ok: false, erro: "Erro ao gerar convite: " + mensagem },
      { status: 500 }
    );
  }
}

// Listagem de convites existentes para o painel da equipe
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const codigo = searchParams.get("codigo");
    const codigoConfigurado = process.env.CODIGO_ACESSO;

    if (!codigoConfigurado || codigo !== codigoConfigurado) {
      return NextResponse.json(
        { ok: false, erro: "Não autorizado." },
        { status: 401 }
      );
    }

    const familias = await prisma.familia.findMany({
      orderBy: { criadoEm: "desc" },
      include: {
        _count: {
          select: { respostas: true },
        },
      },
    });

    return NextResponse.json({ ok: true, familias });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { ok: false, erro: "Erro ao listar convites: " + mensagem },
      { status: 500 }
    );
  }
}
