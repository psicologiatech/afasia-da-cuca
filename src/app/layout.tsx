import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Fraunces } from "next/font/google";
import "@/styles/globals.css";

const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
});

const fraunces = Fraunces({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Conversa Apoiada — Comunicação e Apoio Pós-AVC",
  description:
    "Aplicativo e entrevista com famílias para desenhar apoio de comunicação alternativa para pessoas que tiveram AVC.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${atkinson.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
