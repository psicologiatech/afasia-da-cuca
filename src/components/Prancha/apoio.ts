import { DadosPrancha } from "./tipos";
import { CONTEUDO_INICIAL } from "./conteudoInicial";

// ---------- Guardar no aparelho (IndexedDB) ----------

const DB = "conversa-apoiada-prancha";
const STORE = "kv";
const CHAVE = "dados";

function abrir(): Promise<IDBDatabase> {
  return new Promise((ok, erro) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => ok(req.result);
    req.onerror = () => erro(req.error);
  });
}

export async function carregarDados(): Promise<DadosPrancha> {
  try {
    const db = await abrir();
    const valor = await new Promise<unknown>((ok, erro) => {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get(CHAVE);
      req.onsuccess = () => ok(req.result);
      req.onerror = () => erro(req.error);
    });
    if (valor && typeof valor === "object" && (valor as DadosPrancha).versao === 1) {
      const d = valor as DadosPrancha;
      return { ...d, config: { ...CONTEUDO_INICIAL.config, ...d.config } };
    }
  } catch {
    // sem IndexedDB (aba anônima, por exemplo): segue com o conteúdo inicial
  }
  return structuredClone(CONTEUDO_INICIAL);
}

export async function salvarDados(dados: DadosPrancha): Promise<boolean> {
  try {
    const db = await abrir();
    await new Promise<void>((ok, erro) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(dados, CHAVE);
      tx.oncomplete = () => ok();
      tx.onerror = () => erro(tx.error);
    });
    return true;
  } catch {
    return false;
  }
}

// ---------- Fotos ----------

// Reduz a foto para no máximo 800 px no lado maior, sem cortar, e comprime.
export function prepararFoto(arquivo: File, maior = 800): Promise<string> {
  return new Promise((ok, erro) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      const escala = Math.min(1, maior / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * escala);
      canvas.height = Math.round(img.naturalHeight * escala);
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); erro(new Error("Sem canvas")); return; }
      ctx.fillStyle = "#ffffff"; // fundo branco para imagens com transparência (PNG)
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      ok(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); erro(new Error("Não foi possível ler a foto.")); };
    img.src = url;
  });
}

// ---------- Voz ----------

export function falar(texto: string, velocidade: number) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = "pt-BR";
  u.rate = velocidade;
  const voz = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("pt-br"));
  if (voz) u.voice = voz;
  window.speechSynthesis.speak(u);
}

// ---------- Som de chamar ----------

let ctxAudio: AudioContext | null = null;
let intervalo: ReturnType<typeof setInterval> | null = null;

function bip() {
  if (!ctxAudio) return;
  const agora = ctxAudio.currentTime;
  [0, 0.25].forEach((atraso, i) => {
    const osc = ctxAudio!.createOscillator();
    const ganho = ctxAudio!.createGain();
    osc.type = "square";
    osc.frequency.value = i === 0 ? 880 : 1175;
    ganho.gain.setValueAtTime(0.0001, agora + atraso);
    ganho.gain.exponentialRampToValueAtTime(0.5, agora + atraso + 0.02);
    ganho.gain.exponentialRampToValueAtTime(0.0001, agora + atraso + 0.22);
    osc.connect(ganho).connect(ctxAudio!.destination);
    osc.start(agora + atraso);
    osc.stop(agora + atraso + 0.24);
  });
}

export function iniciarChamado() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!ctxAudio) ctxAudio = new AC();
    void ctxAudio.resume();
    bip();
    if (intervalo) clearInterval(intervalo);
    intervalo = setInterval(bip, 1400);
  } catch {
    // sem áudio: o aviso visual continua
  }
}

export function pararChamado() {
  if (intervalo) clearInterval(intervalo);
  intervalo = null;
}

export function novoId(): string {
  try { return crypto.randomUUID(); } catch { return "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
}
