import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera .next/standalone (server + node_modules mínimos) — é o que o Dockerfile copia
  // pra imagem final, sem precisar levar node_modules completo pro container.
  output: "standalone",
};

export default nextConfig;
