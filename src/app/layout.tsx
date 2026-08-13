import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/presentation/ui/providers/QueryProvider";
import { SistemaSelecionadoProvider } from "@/presentation/ui/features/sistemas/SistemaSelecionadoContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Painel de Conversas",
  description: "Painel de gerenciamento das conversas do chatbot de WhatsApp",
};

const SCRIPT_DARK_MODE = `
(function () {
  try {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_DARK_MODE }} />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <QueryProvider>
          <SistemaSelecionadoProvider>{children}</SistemaSelecionadoProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
