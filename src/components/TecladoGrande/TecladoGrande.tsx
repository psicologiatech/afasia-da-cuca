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

export const TecladoGrande: React.FC<TecladoGrandeProps> = ({ aberto, onFechar }) => {
  const [texto, setTexto] = useState("");

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
          <button type="button" className={styles.btnClose} onClick={onFechar}>
            ✕ Fechar
          </button>
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
        <div className={styles.keyboardGrid}>
          {LETRAS.map((letra) => (
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
