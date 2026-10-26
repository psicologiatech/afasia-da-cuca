"use client";

import React, { useState } from "react";
import { MAPA_EMOJI } from "./mapa";

// Mostra o emoji como imagem Fluent Emoji 3D (Microsoft, licença MIT), para a figura
// ser a mesma no tablet, no celular e no iPad. Se não houver imagem, ou se ela não
// carregar, mostra o emoji do próprio aparelho.

export function temImagemEmoji(emoji?: string): boolean {
  return !!emoji && emoji in MAPA_EMOJI;
}

export const Emoji: React.FC<{ emoji?: string; className?: string }> = ({ emoji, className }) => {
  const [falhou, setFalhou] = useState(false);
  if (!emoji) return null;
  const arquivo = MAPA_EMOJI[emoji];
  if (!arquivo || falhou) return <span className={className} aria-hidden>{emoji}</span>;
  return (
    <img
      src={`/emoji/${arquivo}`}
      alt=""
      aria-hidden
      draggable={false}
      className={className}
      onError={() => setFalhou(true)}
    />
  );
};
