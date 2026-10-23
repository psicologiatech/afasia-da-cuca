"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header/Header";
import { Navbar } from "@/components/Navbar/Navbar";
import { Card } from "@/components/Card/Card";
import { Footer } from "@/components/Footer/Footer";
import styles from "./convite.module.css";

interface ConviteSalvo {
  token: string;
  familia: string;
  criadoEm: string;
}

export default function ConvitePage() {
  const [familia, setFamilia] = useState("");
  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<{ token: string; familia: string } | null>(null);
  const [historico, setHistorico] = useState<ConviteSalvo[]>([]);

  useEffect(() => {
    // Carrega código salvo e histórico local
    try {
      const codigoSalvo = localStorage.getItem("conversa-codigo-acesso");
      if (codigoSalvo) setCodigo(codigoSalvo);

      const histSalvo = localStorage.getItem("conversa-historico-convites");
      if (histSalvo) setHistorico(JSON.parse(histSalvo));
    } catch {}
  }, []);

  const gerarConvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem("");
    setErro("");
    setResultado(null);

    if (!familia.trim()) {
      setErro("Por favor, digite o nome ou apelido da família.");
      return;
    }
    if (!codigo.trim()) {
      setErro("Informe o código de acesso da equipe.");
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch("/api/convite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familia: familia.trim(), codigo: codigo.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.erro || "Falha ao gerar convite");
      }

      // Salva o código de acesso para facilidade
      localStorage.setItem("conversa-codigo-acesso", codigo.trim());

      const novoConvite: ConviteSalvo = {
        token: data.token,
        familia: data.familia,
        criadoEm: new Date().toLocaleDateString("pt-BR"),
      };

      const novoHist = [novoConvite, ...historico];
      setHistorico(novoHist);
      localStorage.setItem("conversa-historico-convites", JSON.stringify(novoHist));

      setResultado({ token: data.token, familia: data.familia });
      setFamilia("");
      setMensagem("Convite criado com sucesso!");
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao processar");
    } finally {
      setCarregando(false);
    }
  };

  const getLinkCompleto = (token: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/entrevista?c=${token}`;
    }
    return `/entrevista?c=${token}`;
  };

  const getTextoWhatsapp = (nomeFam: string, token: string) => {
    const link = getLinkCompleto(token);
    return encodeURIComponent(
      `Olá! Estamos desenvolvendo um aplicativo para apoiar a comunicação de quem teve AVC. Gostaríamos muito de ouvir a experiência de vocês da ${nomeFam}.\n\nVocê e os outros familiares podem responder pelo mesmo link:\n${link}\n\nMuito obrigado pelo apoio e carinho!`
    );
  };

  const copiarLink = (token: string) => {
    const link = getLinkCompleto(token);
    navigator.clipboard.writeText(link);
    setMensagem("Link copiado para a área de transferência!");
  };

  return (
    <>
      <Header
        eyebrow="Conversa Apoiada · Área da Equipe"
        title="Convites para entrevista"
        description="Crie um link exclusivo para cada família. Todos os familiares usam o mesmo link, e as respostas são organizadas no banco de dados."
      />
      <Navbar />

      <main className="wrap">
        <section className={styles.section}>
          <h2>Novo convite</h2>
          <form onSubmit={gerarConvite} className={styles.metaFields}>
            <label className={styles.field}>
              <span>Nome ou apelido da família</span>
              <input
                type="text"
                className={styles.input}
                placeholder="Ex.: Família da Dona Maria"
                value={familia}
                onChange={(e) => setFamilia(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>Código de acesso</span>
              <input
                type="password"
                className={styles.input}
                placeholder="Código de segurança da equipe"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </label>

            <div>
              <button type="submit" className={styles.btnPrimary} disabled={carregando}>
                {carregando ? "Gerando..." : "Gerar convite"}
              </button>
            </div>
          </form>

          {mensagem && <div className={styles.savedMsg}>{mensagem}</div>}
          {erro && <div className={styles.errorMsg}>{erro}</div>}

          {resultado && (
            <Card title={`Link para ${resultado.familia}`} className="card" style={{ marginTop: 24 }}>
              <div className={styles.linkOut}>{getLinkCompleto(resultado.token)}</div>
              <div className={styles.toolbar}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => copiarLink(resultado.token)}
                  style={{ width: "auto" }}
                >
                  Copiar link
                </button>
                <a
                  href={`https://wa.me/?text=${getTextoWhatsapp(resultado.familia, resultado.token)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnSecondary}
                >
                  Enviar pelo WhatsApp
                </a>
              </div>
            </Card>
          )}
        </section>

        {historico.length > 0 && (
          <section className={styles.section}>
            <h2>Convites gerados neste navegador</h2>
            <ul className={styles.historyList}>
              {historico.map((item) => (
                <li key={item.token} className={styles.historyItem}>
                  <div>
                    <strong>{item.familia}</strong>
                    <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                      Criado em {item.criadoEm} · Token: <code>{item.token}</code>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => copiarLink(item.token)}
                    >
                      Copiar link
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
