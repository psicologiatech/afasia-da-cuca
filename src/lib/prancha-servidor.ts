import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Apoio às rotas /api/prancha: token do link, PIN do modo família e limpeza dos dados.

export const TAMANHO_MAX_DADOS = 1_000_000; // ~1 MB de JSON (as fotos não entram aqui)

export function novoToken(): string {
  return randomBytes(18).toString("base64url");
}

export function hashPin(pin: string): string {
  const sal = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, sal, 32).toString("hex");
  return `${sal}:${hash}`;
}

export function pinConfere(pin: string | null, pinHash: string): boolean {
  if (!pin) return false;
  const [sal, hash] = pinHash.split(":");
  if (!sal || !hash) return false;
  const calculado = scryptSync(pin, sal, 32);
  const guardado = Buffer.from(hash, "hex");
  return guardado.length === calculado.length && timingSafeEqual(guardado, calculado);
}

export function pinValido(pin: unknown): pin is string {
  return typeof pin === "string" && /^\d{6,10}$/.test(pin);
}

export async function buscarPrancha(token: string) {
  if (!token || token.length > 64) return null;
  return prisma.prancha.findUnique({ where: { token } });
}

export function erro(mensagem: string, status: number) {
  return NextResponse.json({ ok: false, erro: mensagem }, { status });
}

export function pinDoPedido(req: NextRequest): string | null {
  return req.headers.get("x-pin");
}

// Tira do JSON qualquer foto embutida (data URL): no servidor, só o caminho no Blob.
export function limparDados(dados: unknown): unknown {
  if (!dados || typeof dados !== "object") return dados;
  const d = JSON.parse(JSON.stringify(dados)) as { telas?: { itens?: Record<string, unknown>[] }[] };
  for (const tela of d.telas || []) {
    for (const item of tela.itens || []) {
      delete item.foto;
    }
  }
  return d;
}

// As fotos de uma prancha ficam sempre sob este prefixo no Blob.
export function prefixoFotos(pranchaId: string): string {
  return `pranchas/${pranchaId}/`;
}
