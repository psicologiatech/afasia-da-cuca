"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./TecladoGrande.module.css";

interface TecladoGrandeProps {
  aberto: boolean;
  onFechar: () => void;
}

const LETRAS = [
  "A", "B", "C", "D", "E", "F",
  "G", "H", "I", "J", "K", "L",
  "M", "N", "O", "P", "Q", "R",
  "S", "T", "U", "V", "W", "X",
  "Y", "Z", "Ç", ".", ",", "?",
];

// Mesma disposição do teclado do celular (QWERTY), com Ç ao lado do L
const LETRAS_CELULAR = [
  "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P",
  "A", "S", "D", "F", "G", "H", "J", "K", "L", "Ç",
  "Z", "X", "C", "V", "B", "N", "M", ".", ",", "?",
];

type Disposicao = "alfabetica" | "celular";
const CHAVE_DISPOSICAO = "conversa-teclado-disposicao";

export const TecladoGrande: React.FC<TecladoGrandeProps> = ({ aberto, onFechar }) => {
  const [texto, setTexto] = useState("");
  const [disposicao, setDisposicao] = useState<Disposicao>("alfabetica");

  useEffect(() => {
    try { if (localStorage.getItem(CHAVE_DISPOSICAO) === "celular") setDisposicao("celular"); } catch { /* */ }
  }, []);

  const trocarDisposicao = () => {
    const nova: Disposicao = disposicao === "alfabetica" ? "celular" : "alfabetica";
    setDisposicao(nova);
    try { localStorage.setItem(CHAVE_DISPOSICAO, nova); } catch { /* */ }
  };

  const falar = useCallback((mensagem: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(mensagem);
    u.lang = "pt-BR";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }, []);

  const handleTecla = (caractere: string) => {
    setTexto((prev) => prev + caractere);
  };

  const handleEspaco = () => {
    setTexto((prev) => prev + " ");
  };

  const handleApagar = () => {
    setTexto((prev) => prev.slice(0, -1));
  };

  const handleLimpar = () => {
    setTexto("");
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleFalar = () => {
    if (!texto.trim()) return;
    falar(texto.trim());
  };

  // Fecha no ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && aberto) onFechar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className={styles.overlay} onClick={onFechar} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.topBar}>
          <h2 className={styles.title}>
            <span>⌨️</span> Teclado Grande
          </h2>
          <div className={styles.topAcoes}>
          <button type="button" className={styles.btnTrocar} onClick={trocarDisposicao} aria-label="Trocar a ordem das letras">
            {disposicao === "alfabetica" ? "⌨️ Teclado do celular" : "🔤 Ordem alfabética"}
          </button>
          <button type="button" className={styles.btnClose} onClick={onFechar}>
            ✕ Fechar
          </button>
          </div>
        </div>

        {/* Visor Enorme */}
        <div className={styles.display}>
          {texto ? texto : <span className={styles.placeholder}>Toque nas letras abaixo...</span>}
        </div>

        {/* Barra de Ações: Falar, Apagar, Limpar */}
        <div className={styles.actionsBar}>
          <button type="button" className={styles.btnSpeak} onClick={handleFalar}>
            <span>🔊</span> FALAR
          </button>
          <button type="button" className={styles.btnBackspace} onClick={handleApagar}>
            ⌫ Apagar
          </button>
          <button type="button" className={styles.btnClear} onClick={handleLimpar}>
            Limpar
          </button>
        </div>

        {/* Letras Grandes */}
        <div className={`${styles.keyboardGrid} ${disposicao === "celular" ? styles.gridCelular : ""}`}>
          {(disposicao === "celular" ? LETRAS_CELULAR : LETRAS).map((letra) => (
            <button
              key={letra}
              type="button"
              className={styles.keyBtn}
              onClick={() => handleTecla(letra)}
            >
              {letra}
            </button>
          ))}

          <button
            type="button"
            className={`${styles.keyBtn} ${styles.keySpace}`}
            onClick={handleEspaco}
          >
            ESPAÇO
          </button>

          <button
            type="button"
            className={`${styles.keyBtn} ${styles.keySim}`}
            onClick={() => {
              handleTecla(" SIM ");
              falar("Sim!");
            }}
          >
            👍 SIM
          </button>

          <button
            type="button"
            className={`${styles.keyBtn} ${styles.keyNao}`}
            onClick={() => {
              handleTecla(" NÃO ");
              falar("Não!");
            }}
          >
            👎 NÃO
          </button>
        </div>
      </div>
    </div>
  );
};
