import { DadosPrancha, ItemPrancha } from "./tipos";

// Sincronização com o servidor (Neon + Blob privado).
// Regra: o aparelho sempre funciona com a cópia local; o servidor é atualizado quando dá.
// Conflitos: vale a última gravação (a prancha é editada por poucas pessoas da família).

const CHAVE_TOKEN = "conversa-prancha-token";
const CHAVE_PIN = "conversa-prancha-pin"; // sessionStorage: some ao fechar a aba
const CHAVE_SYNC = "conversa-prancha-sync";

export interface EstadoSync {
  versaoServidor?: number;
  pendente: boolean;
  apagar: string[]; // fotos a apagar no Blob
}

export function obterToken(): string | null {
  try {
    const daUrl = new URLSearchParams(location.search).get("t");
    if (daUrl) { localStorage.setItem(CHAVE_TOKEN, daUrl); return daUrl; }
    return localStorage.getItem(CHAVE_TOKEN);
  } catch { return null; }
}

export function esquecerToken() {
  try { localStorage.removeItem(CHAVE_TOKEN); localStorage.removeItem(CHAVE_SYNC); sessionStorage.removeItem(CHAVE_PIN); } catch { /* */ }
}

export function lerPin(): string | null {
  try { return sessionStorage.getItem(CHAVE_PIN); } catch { return null; }
}
export function guardarPin(pin: string | null) {
  try { if (pin) sessionStorage.setItem(CHAVE_PIN, pin); else sessionStorage.removeItem(CHAVE_PIN); } catch { /* */ }
}

export function lerSync(): EstadoSync {
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE_SYNC) || "null");
    if (s && typeof s === "object") return { pendente: !!s.pendente, apagar: Array.isArray(s.apagar) ? s.apagar : [], versaoServidor: s.versaoServidor };
  } catch { /* */ }
  return { pendente: false, apagar: [] };
}
export function salvarSync(s: EstadoSync) {
  try { localStorage.setItem(CHAVE_SYNC, JSON.stringify(s)); } catch { /* */ }
}

const base = (token: string) => `/api/prancha/${encodeURIComponent(token)}`;
export const urlFoto = (token: string, caminho: string) => `${base(token)}/foto?p=${encodeURIComponent(caminho)}`;

export async function baixar(token: string, pin?: string | null): Promise<{ versao: number; dados: DadosPrancha; podeEditar?: boolean; nome: string }> {
  const r = await fetch(base(token), { cache: "no-store", headers: pin ? { "x-pin": pin } : undefined });
  const j = await r.json();
  if (!r.ok || !j.ok) throw new Error(j.erro || "Não foi possível ler a prancha.");
  return j;
}

function todosItens(d: DadosPrancha): ItemPrancha[] {
  return d.telas.flatMap((t) => t.itens);
}

async function dataUrlDeResposta(r: Response): Promise<string> {
  const blob = await r.blob();
  return new Promise((ok, erro) => {
    const leitor = new FileReader();
    leitor.onload = () => ok(String(leitor.result));
    leitor.onerror = () => erro(leitor.error);
    leitor.readAsDataURL(blob);
  });
}

// Junta o conteúdo do servidor com as fotos já guardadas no aparelho; baixa as que faltam.
export async function mesclarFotos(servidor: DadosPrancha, local: DadosPrancha, token: string): Promise<DadosPrancha> {
  const locais = new Map(todosItens(local).map((i) => [i.id, i]));
  const copia: DadosPrancha = JSON.parse(JSON.stringify(servidor));
  await Promise.all(
    todosItens(copia).map(async (item) => {
      if (!item.fotoBlob) { delete item.foto; return; }
      const l = locais.get(item.id);
      if (l && l.fotoBlob === item.fotoBlob && l.foto) { item.foto = l.foto; return; }
      try {
        const r = await fetch(urlFoto(token, item.fotoBlob));
        if (r.ok) item.foto = await dataUrlDeResposta(r);
      } catch { /* sem internet: a foto aparece na próxima vez */ }
    })
  );
  return copia;
}

// Envia ao servidor o que está pendente: fotos novas, fotos a apagar e o conteúdo.
export async function enviar(token: string, pin: string, dados: DadosPrancha, sync: EstadoSync): Promise<{ dados: DadosPrancha; sync: EstadoSync }> {
  const cabecalho = { "x-pin": pin };
  const restantes: string[] = [];
  for (const caminho of sync.apagar) {
    try {
      const r = await fetch(urlFoto(token, caminho), { method: "DELETE", headers: cabecalho });
      if (!r.ok && r.status !== 404) restantes.push(caminho);
    } catch { restantes.push(caminho); }
  }

  const copia: DadosPrancha = JSON.parse(JSON.stringify(dados));
  for (const item of todosItens(copia)) {
    if (item.foto && !item.fotoBlob) {
      const foto = await (await fetch(item.foto)).blob();
      const r = await fetch(`${base(token)}/foto`, { method: "POST", headers: { ...cabecalho, "content-type": "image/jpeg" }, body: foto });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.erro || "Não foi possível enviar uma foto.");
      item.fotoBlob = j.caminho;
    }
  }

  const semFotos: DadosPrancha = JSON.parse(JSON.stringify(copia));
  todosItens(semFotos).forEach((i) => delete i.foto);
  const r = await fetch(base(token), { method: "PUT", headers: { ...cabecalho, "content-type": "application/json" }, body: JSON.stringify({ dados: semFotos }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) throw new Error(j.erro || "Não foi possível salvar na nuvem.");
  return { dados: copia, sync: { versaoServidor: j.versao, pendente: false, apagar: restantes } };
}
