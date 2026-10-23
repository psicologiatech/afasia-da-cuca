"use client";

import React, { useEffect, useState } from "react";
import styles from "./criar.module.css";
import { linkDaPrancha } from "@/components/Prancha/sincronizacao";

// Área da equipe: cria a prancha de uma família na nuvem e mostra o link do tablet.
export default function CriarPranchaPage() {
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [msg, setMsg] = useState("");
  const [link, setLink] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    try { setCodigo(localStorage.getItem("conversa-codigo-acesso") || ""); } catch { /* */ }
  }, []);

  const criar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(""); setLink("");
    if (!/^\d{6,10}$/.test(pin)) { setMsg("O PIN precisa ter de 6 a 10 números."); return; }
    if (pin !== pin2) { setMsg("Os dois PINs não são iguais."); return; }
    setEnviando(true);
    try {
      const r = await fetch("/api/prancha", {
        method: "POST",
        headers: { "content-type": "application/json", "x-codigo-acesso": codigo },
        body: JSON.stringify({ nome, pin }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.erro || "Não foi possível criar.");
      try { localStorage.setItem("conversa-codigo-acesso", codigo); } catch { /* */ }
      setLink(linkDaPrancha(j.token));
      setPin(""); setPin2("");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro ao criar.");
    }
    setEnviando(false);
  };

  const copiar = async () => {
    try { await navigator.clipboard.writeText(link); setMsg("Link copiado."); }
    catch { setMsg("Selecione o link e copie."); }
  };

  return (
    <main className={`wrap ${styles.pagina}`}>
      <h1>Criar prancha da família</h1>
      <p>A prancha fica guardada na nuvem: fotos no armazenamento privado, conteúdo no banco. O tablet abre pelo link; para trocar fotos e frases, a família usa o PIN.</p>

      <form onSubmit={criar} className={styles.form}>
        <label className={styles.campo}>
          <span>Código de acesso da equipe</span>
          <input id="codigo" type="password" value={codigo} onChange={(e) => setCodigo(e.target.value)} autoComplete="off" required />
        </label>
        <label className={styles.campo}>
          <span>Nome da prancha</span>
          <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Prancha de casa" required maxLength={80} />
        </label>
        <div className={styles.linha}>
          <label className={styles.campo}>
            <span>PIN do modo família (6 a 10 números)</span>
            <input id="pin" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} autoComplete="new-password" required />
          </label>
          <label className={styles.campo}>
            <span>Repita o PIN</span>
            <input id="pin2" type="password" inputMode="numeric" value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))} autoComplete="new-password" required />
          </label>
        </div>
        <button type="submit" className={styles.botao} disabled={enviando}>{enviando ? "Criando…" : "Criar prancha"}</button>
      </form>

      {msg && <p className={styles.msg}>{msg}</p>}

      {link && (
        <section className={styles.resultado}>
          <h2>Pronto</h2>
          <p>Abra este link no tablet (e no celular de quem for adicionar fotos). Guarde o PIN: ele não aparece de novo.</p>
          <code className={styles.link}>{link}</code>
          <div className={styles.linha}>
            <button type="button" className={styles.botao} onClick={copiar}>Copiar link</button>
            <a className={styles.botaoSec} href={link}>Abrir a prancha</a>
          </div>
          <p className={styles.dica}>Quem tiver o link vê a prancha, mas só altera com o PIN. Não publique o link em grupos abertos.</p>
        </section>
      )}
    </main>
  );
}
