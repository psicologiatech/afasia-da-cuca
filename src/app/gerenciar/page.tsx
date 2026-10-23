import { redirect } from "next/navigation";

// A edição agora é feita na própria prancha, pelo modo família (segurar a ⚙).
// A tela antiga continua em src/components/GerenciarAntigo, fora das rotas publicadas.
export default function GerenciarPage() {
  redirect("/prancha");
}
