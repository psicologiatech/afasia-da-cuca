import { NextRequest, NextResponse } from "next/server";

// Confere o código da equipe (variável CODIGO_ACESSO) enviado no cabeçalho "x-codigo-acesso".
// Retorna uma resposta de erro quando não autorizado, ou null quando pode seguir.
export function exigirCodigo(req: NextRequest): NextResponse | null {
  const configurado = process.env.CODIGO_ACESSO;
  if (!configurado) {
    return NextResponse.json({ ok: false, erro: "CODIGO_ACESSO não configurado no servidor." }, { status: 500 });
  }
  if (req.headers.get("x-codigo-acesso") !== configurado) {
    return NextResponse.json({ ok: false, erro: "Código de acesso ausente ou incorreto." }, { status: 401 });
  }
  return null;
}
