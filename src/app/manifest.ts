import type { MetadataRoute } from "next";

// Torna a prancha instalável: abre em tela cheia, sem a barra do navegador.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Conversa Apoiada",
    short_name: "Prancha",
    description: "Prancha de comunicação por fotos.",
    lang: "pt-BR",
    start_url: "/prancha",
    scope: "/",
    display: "fullscreen",
    display_override: ["fullscreen", "standalone"],
    orientation: "any",
    background_color: "#f7f3ec",
    theme_color: "#1f6f62",
    icons: [
      { src: "/icons/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
