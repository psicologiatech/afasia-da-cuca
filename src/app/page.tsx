import { redirect } from "next/navigation";

// A tela inicial agora é a prancha por fotos.
// A primeira versão (componente HomeApp) continua no código, mas não é mais publicada.
export default function HomePage({ searchParams }: { searchParams: { t?: string } }) {
  const t = typeof searchParams.t === "string" ? searchParams.t : "";
  redirect(t ? `/prancha?t=${encodeURIComponent(t)}` : "/prancha");
}
