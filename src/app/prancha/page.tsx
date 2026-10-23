import type { Metadata } from "next";
import { Prancha } from "@/components/Prancha/Prancha";

export const metadata: Metadata = {
  title: "Prancha — Conversa Apoiada",
  description: "Prancha de comunicação por fotos, para usar no tablet.",
};

export default function PranchaPage() {
  return <Prancha />;
}
