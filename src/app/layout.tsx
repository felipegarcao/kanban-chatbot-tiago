import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/presentation/ui/providers/QueryProvider";
import { SCRIPT_TEMA } from "@/presentation/ui/lib/theme";
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
  appleWebApp: {
    capable: true,
    title: "Conversas",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
