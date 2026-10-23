"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { TOPICOS_INICIAIS, PARTES_CORPO, TopicoDado, SubcategoriaDado, ItemDado } from "@/data/dadosIniciais";
import { TecladoGrande } from "../TecladoGrande/TecladoGrande";
import styles from "./HomeApp.module.css";

// Cores da escala de dor (0 a 10) de verde até vermelho intenso
const CORES_DOR = [
  "#27ae60", // 0 Sem dor
  "#2ecc71", // 1
  "#a2d149", // 2
  "#f1c40f", // 3 Leve
  "#f39c12", // 4
  "#e67e22", // 5 Moderada
  "#d35400", // 6
  "#e74c3c", // 7 Forte
  "#c0392b", // 8
  "#962d22", // 9 Muito forte
  "#781e15", // 10 Insuportável
];

export const HomeApp: React.FC = () => {
  // Dados de tópicos (iniciais ou personalizados do banco/localStorage)
  const [topicos, setTopicos] = useState<TopicoDado[]>(TOPICOS_INICIAIS);

  // Estados de Navegação
  const [topicoAtivo, setTopicoAtivo] = useState<TopicoDado | null>(null);
  const [subcategoriaAtiva, setSubcategoriaAtiva] = useState<SubcategoriaDado | null>(null);
  const [parteCorpoAtiva, setParteCorpoAtiva] = useState<{ id: string; nome: string; icone: string } | null>(null);

  // Modal do Teclado Grande
  const [tecladoAberto, setTecladoAberto] = useState(false);

  // Feedback do que foi falado
  const [falandoAgora, setFalandoAgora] = useState("");

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("conversa-db-custom");
      if (salvo) {
        setTopicos(JSON.parse(salvo));
      }
    } catch {}
  }, []);

  // Síntese de voz com SpeechSynthesis
  const falar = useCallback((texto: string) => {
    setFalandoAgora(texto);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "pt-BR";
      u.rate = 0.9;
      u.onend = () => {
        setTimeout(() => setFalandoAgora(""), 1200);
      };
      window.speechSynthesis.speak(u);
    } else {
      setTimeout(() => setFalandoAgora(""), 2000);
    }
  }, []);

  const voltarParaInicio = () => {
    setTopicoAtivo(null);
    setSubcategoriaAtiva(null);
    setParteCorpoAtiva(null);
  };

  const voltarUmNivel = () => {
    if (parteCorpoAtiva) {
      setParteCorpoAtiva(null);
      return;
    }
    if (subcategoriaAtiva) {
      setSubcategoriaAtiva(null);
      return;
    }
    setTopicoAtivo(null);
  };

  return (
    <div className={styles.container}>
      {/* 1. TOPO: Teclado Bem Grande e Ícone de Gerenciar DB */}
      <header className={styles.topHeader}>
        <button
          type="button"
          className={styles.btnTeclado}
          onClick={() => setTecladoAberto(true)}
          aria-label="Abrir Teclado Grande"
        >
          <span style={{ fontSize: "2rem" }}>⌨️</span>
          <span>TECLADO GRANDE</span>
        </button>

        <Link
          href="/gerenciar"
          className={styles.btnGerenciar}
          title="Gerenciar Banco de Dados"
          aria-label="Gerenciar Banco de Dados"
        >
          <span style={{ fontSize: "1.8rem" }}>⚙️</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Banco DB</span>
        </Link>
      </header>

      {/* 2. Feedback de Fala em Voz Alta */}
      {falandoAgora && (
        <div className={styles.speakingNotice}>
          <span>🔊</span>
          <span>&quot;{falandoAgora}&quot;</span>
        </div>
      )}

      {/* 3. Respostas Rápidas (Sim e Não) sempre visíveis na tela inicial */}
      {!topicoAtivo && (
        <div className={styles.quickRow}>
          <button
            type="button"
            className={`${styles.btnQuick} ${styles.btnSim}`}
            onClick={() => falar("Sim!")}
          >
            <span>👍</span>
            <span>SIM</span>
          </button>

          <button
            type="button"
            className={`${styles.btnQuick} ${styles.btnNao}`}
            onClick={() => falar("Não!")}
          >
            <span>👎</span>
            <span>NÃO</span>
          </button>
        </div>
      )}

      {/* 4. Barra de Voltar quando dentro de um tópico */}
      {topicoAtivo && (
        <div className={styles.breadcrumbBar}>
          <button type="button" className={styles.btnVoltar} onClick={voltarUmNivel}>
            <span>←</span> Voltar
          </button>
          <h2 className={styles.subTitle}>
            {parteCorpoAtiva
              ? `Dor: ${parteCorpoAtiva.nome}`
              : subcategoriaAtiva
              ? subcategoriaAtiva.nome
              : topicoAtivo.nome}
          </h2>
        </div>
      )}

      {/* ========================================================
          VISÃO 1: LISTAGEM PRINCIPAL DOS TÓPICOS FAVORITOS
          ======================================================== */}
      {!topicoAtivo && (
        <main className={styles.topicsGrid}>
          {topicos.map((topico) => (
            <button
              key={topico.id}
              type="button"
              className={styles.topicCard}
              onClick={() => {
                setTopicoAtivo(topico);
                falar(topico.nome);
              }}
            >
              <div className={styles.topicContent}>
                <span className={styles.topicIcon}>{topico.icone}</span>
                <span className={styles.topicName}>{topico.nome}</span>
              </div>
              <span className={styles.topicArrow}>→</span>
            </button>
          ))}
        </main>
      )}

      {/* ========================================================
          VISÃO 2: SUB-CATEGORIAS (Ex: Comida Doce / Salgada, Pessoas)
          ======================================================== */}
      {topicoAtivo && topicoAtivo.subcategorias && !subcategoriaAtiva && (
        <div className={styles.itemsGrid}>
          {topicoAtivo.subcategorias.map((sub) => (
            <button
              key={sub.id}
              type="button"
              className={styles.itemBtn}
              onClick={() => {
                setSubcategoriaAtiva(sub);
                falar(sub.nome);
              }}
            >
              <span className={styles.itemEmoji}>{sub.icone}</span>
              <span className={styles.itemName}>{sub.nome}</span>
            </button>
          ))}
        </div>
      )}

      {/* ========================================================
          VISÃO 3: ITENS DA SUBCATEGORIA OU TÓPICO DIRETO
          ======================================================== */}
      {topicoAtivo && (subcategoriaAtiva || topicoAtivo.itens) && (
        <div className={styles.itemsGrid}>
          {(subcategoriaAtiva ? subcategoriaAtiva.itens : topicoAtivo.itens || []).map((item: ItemDado) => (
            <button
              key={item.id}
              type="button"
              className={styles.itemBtn}
              onClick={() => falar(item.fala || item.nome)}
            >
              <span className={styles.itemEmoji}>{item.imagem}</span>
              <span className={styles.itemName}>{item.nome}</span>
            </button>
          ))}
        </div>
      )}

      {/* ========================================================
          VISÃO 4: FLUXO DE DOR NO CORPO (Parte do Corpo -> Escala 0 a 10)
          ======================================================== */}
      {topicoAtivo && topicoAtivo.tipo === "dor" && (
        <div>
          {/* Passo 1: Qual parte do corpo? */}
          {!parteCorpoAtiva ? (
            <div>
              <p style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 16px", color: "var(--muted)" }}>
                Toque onde está doendo:
              </p>
              <div className={styles.itemsGrid}>
                {PARTES_CORPO.map((parte) => (
                  <button
                    key={parte.id}
                    type="button"
                    className={styles.itemBtn}
                    onClick={() => {
                      setParteCorpoAtiva(parte);
                      falar(`Dor na parte: ${parte.nome}. Qual é o nível da dor?`);
                    }}
                  >
                    <span className={styles.itemEmoji}>{parte.icone}</span>
                    <span className={styles.itemName}>{parte.nome}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Passo 2: Escala de Dor de 0 a 10 */
            <div>
              <p style={{ fontSize: "1.35rem", fontWeight: 700, margin: "0 0 16px", color: "var(--muted)" }}>
                De 0 a 10, quanto está doendo na <strong>{parteCorpoAtiva.nome}</strong>?
              </p>

              <div className={styles.painScaleGrid}>
                {Array.from({ length: 11 }, (_, i) => i).map((nivel) => {
                  let legenda = "";
                  if (nivel === 0) legenda = "Sem dor";
                  else if (nivel === 3) legenda = "Leve";
                  else if (nivel === 5) legenda = "Média";
                  else if (nivel === 8) legenda = "Forte";
                  else if (nivel === 10) legenda = "Máxima";

                  return (
                    <button
                      key={nivel}
                      type="button"
                      className={styles.painBtn}
                      style={{ backgroundColor: CORES_DOR[nivel] }}
                      onClick={() => {
                        const falaDor = nivel === 0
                          ? `Não estou sentindo dor na ${parteCorpoAtiva.nome}.`
                          : `Estou com dor na ${parteCorpoAtiva.nome}, nível ${nivel} de 10!`;
                        falar(falaDor);
                      }}
                    >
                      <span>{nivel}</span>
                      {legenda && <span className={styles.painSub}>{legenda}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal do Teclado Grande */}
      <TecladoGrande aberto={tecladoAberto} onFechar={() => setTecladoAberto(false)} />
    </div>
  );
};
