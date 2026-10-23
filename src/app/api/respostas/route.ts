import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/respostas?token=XYZ
// Devolve as respostas dos familiares que já responderam para apoiar a complementação mútua.
// O Bloco H (questões íntimas e de sobrecarga) é filtrado por privacidade e NÃO é devolvido.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { ok: false, erro: "Código de convite não informado." },
        { status: 400 }
      );
    }

    const familia = await prisma.familia.findUnique({
      where: { token },
      include: {
        respostas: {
          select: {
            id: true,
            nomeRespondente: true,
            relacao: true,
            pessoa: true,
            papel: true,
            respostas: true,
            criadoEm: true,
            atualizadoEm: true,
          },
        },
      },
    });

    if (!familia) {
      return NextResponse.json(
        { ok: false, erro: "Link de convite inválido ou expirado. Peça um novo link à equipe." },
        { status: 404 }
      );
    }

    // Filtra as respostas para omitir o Bloco H (privado) antes de retornar para os familiares
    const listaRespostas = (familia as any).respostas || [];
    const respostasPublicas = listaRespostas.map((r: any) => {
      const dados = (r.respostas as Record<string, string>) || {};
      const filtrado: Record<string, string> = {};

      for (const [chave, valor] of Object.entries(dados)) {
        // Omite qualquer pergunta do bloco H (privativo)
        if (!chave.startsWith("H_")) {
          filtrado[chave] = valor;
        }
      }

      return {
        id: r.id,
        nome: r.nomeRespondente,
        relacao: r.relacao,
        pessoa: r.pessoa,
        papel: r.papel,
        respostas: filtrado,
        atualizadoEm: r.atualizadoEm,
      };
    });

    return NextResponse.json({
      ok: true,
      familia: familia.nome,
      respostas: respostasPublicas,
    });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { ok: false, erro: "Erro ao carregar respostas: " + mensagem },
      { status: 500 }
    );
  }
}

// POST /api/respostas
// Grava ou atualiza a resposta do familiar no banco de dados
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, id, respondente, papel, consentimento, respostas } = body;

    if (!token || !id) {
      return NextResponse.json(
        { ok: false, erro: "Identificação do convite ou da resposta ausente." },
        { status: 400 }
      );
    }

    if (!consentimento) {
      return NextResponse.json(
        { ok: false, erro: "É necessário consentir com o uso das informações para envio." },
        { status: 400 }
      );
    }

    const familia = await prisma.familia.findUnique({
      where: { token },
    });

    if (!familia) {
      return NextResponse.json(
        { ok: false, erro: "Este link de convite não é válido. Peça um novo link a quem enviou." },
        { status: 404 }
      );
    }

    const nome = String(respondente?.nome || "").trim();
    const relacao = String(respondente?.relacao || "").trim();
    const pessoa = String(respondente?.pessoa || "").trim() || null;
    const papelRespondente = String(papel || "principal");

    // Upsert: atualiza se já existir resposta desse dispositivo, ou cria nova
    await prisma.resposta.upsert({
      where: { id: String(id) },
      update: {
        nomeRespondente: nome,
        relacao,
        pessoa,
        papel: papelRespondente,
        consentimento: true,
        respostas: (respostas || {}) as any,
      },
      create: {
        id: String(id),
        familiaId: familia.id,
        nomeRespondente: nome,
        relacao,
        pessoa,
        papel: papelRespondente,
        consentimento: true,
        respostas: (respostas || {}) as any,
      },
    });

    return NextResponse.json({
      ok: true,
      mensagem: "Suas respostas foram gravadas com sucesso!",
    });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { ok: false, erro: "Erro ao gravar respostas: " + mensagem },
      { status: 500 }
    );
  }
}
