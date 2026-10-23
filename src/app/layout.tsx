import type { Metadata, Viewport } from "next";
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
  title: "Afasia da Cuca",
  description:
    "Aplicativo e entrevista com famílias para desenhar apoio de comunicação alternativa para pessoas que tiveram AVC.",
  applicationName: "Afasia da Cuca",
  appleWebApp: { capable: true, title: "Afasia da Cuca", statusBarStyle: "black-translucent" },
  icons: { icon: "/icons/icone-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#1f6f62",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
