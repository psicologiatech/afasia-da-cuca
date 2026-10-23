import type { Metadata } from "next";
import { Prancha } from "@/components/Prancha/Prancha";

export const metadata: Metadata = {
  title: "Afasia da Cuca",
  description: "Prancha de comunicação por fotos, para usar no tablet.",
};

export default function PranchaPage() {
  return <Prancha />;
}
