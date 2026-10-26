import React from "react";

// Bonequinho para a tela de Dor: sempre o mesmo corpo, com só a parte dolorida pintada.
// Mais fácil de apontar do que oito figuras diferentes, e diz exatamente o lugar.
// "costas" mostra o corpo de trás (cabelo cobrindo a cabeça, sem rosto).

export type ParteCorpo = "cabeca" | "garganta" | "peito" | "barriga" | "costas" | "braco" | "perna";

const BASE = "var(--corpo, #d8cdbd)";
const CONTORNO = "var(--corpoContorno, #8a7f70)";
const DOR = "var(--corpoDor, #d23c2a)";
const CABELO = "var(--corpoCabelo, #6b5443)";

export function ehParteCorpo(id: string): id is ParteCorpo {
  return ["cabeca", "garganta", "peito", "barriga", "costas", "braco", "perna"].includes(id);
}

export const FiguraCorpo: React.FC<{ parte: ParteCorpo; className?: string }> = ({ parte, className }) => {
  const de = parte === "costas";
  const cor = (p: ParteCorpo | ParteCorpo[]) => ((Array.isArray(p) ? p : [p]).includes(parte) ? DOR : BASE);
  const tronco = de ? cor("costas") : undefined;
  const comum = { stroke: CONTORNO, strokeWidth: 2.5, strokeLinejoin: "round" as const };

  return (
    <svg viewBox="4 0 112 150" className={className} aria-hidden focusable="false">
      {/* braços: o da direita da tela pode ser o dolorido */}
      <path d="M31 47 C17 51 13 70 11 92 L9 113 C8 121 22 122 23 114 L26 95 C28 81 30 72 34 66 Z" fill={BASE} {...comum} />
      <path d="M89 47 C103 51 107 70 109 92 L111 113 C112 121 98 122 97 114 L94 95 C92 81 90 72 86 66 Z" fill={de ? BASE : cor("braco")} {...comum} />
      {/* pernas */}
      <path d="M34 103 L31 140 C30 148 46 149 47 141 L57 107 Z" fill={BASE} {...comum} />
      <path d="M86 103 L89 140 C90 148 74 149 73 141 L63 107 Z" fill={de ? BASE : cor("perna")} {...comum} />
      {/* tronco: peito em cima, barriga embaixo (de costas, tudo é "costas") */}
      <path d="M30 47 C45 41 75 41 90 47 C93 56 93 66 91 75 L29 75 C27 66 27 56 30 47 Z" fill={tronco ?? cor("peito")} {...comum} />
      <path d="M29 75 L91 75 C92 87 90 98 86 107 L34 107 C30 98 28 87 29 75 Z" fill={tronco ?? cor("barriga")} {...comum} />
      {/* pescoço */}
      <path d="M51 34 L69 34 L70 45 C63 47 57 47 50 45 Z" fill={de ? BASE : cor("garganta")} {...comum} />
      {/* cabeça */}
      <circle cx="60" cy="20" r="17" fill={de ? BASE : cor("cabeca")} {...comum} />
      {de ? (
        // cabelo cobrindo a cabeça toda: é o corpo visto de trás
        <path d="M43 21 C42 4 78 4 77 21 C77 28 74 33 71 36 C64 33 56 33 49 36 C46 33 43 28 43 21 Z" fill={CABELO} />
      ) : (
        <>
          <circle cx="54" cy="19" r="2.3" fill={CONTORNO} />
          <circle cx="66" cy="19" r="2.3" fill={CONTORNO} />
          <path d="M55 27 Q60 30 65 27" fill="none" stroke={CONTORNO} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};
