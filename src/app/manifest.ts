import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Painel de Conversas",
    short_name: "Conversas",
    description: "Painel de gerenciamento das conversas do chatbot de WhatsApp",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#4f46e5",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512-maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
