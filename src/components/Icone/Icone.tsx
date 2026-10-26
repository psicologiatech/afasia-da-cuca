import React from "react";
import { ICONES } from "./icones";

// Ícone de linha com preenchimento suave (duotone). Usa a cor do texto (currentColor).
// Se não houver ícone para a chave, devolve null e quem chama decide o que mostrar.

export function temIcone(chave?: string): boolean {
  return !!chave && chave in ICONES;
}

export const Icone: React.FC<{ chave?: string; className?: string }> = ({ chave, className }) => {
  if (!chave || !ICONES[chave]) return null;
  return (
    <svg
      viewBox="0 0 256 256"
      className={className}
      fill="currentColor"
      aria-hidden
      focusable="false"
      dangerouslySetInnerHTML={{ __html: ICONES[chave] }}
    />
  );
};
