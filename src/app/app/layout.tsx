"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppHeader } from "@/presentation/ui/components/AppHeader";
import { useUsuarioLogado } from "@/presentation/ui/features/auth/useUsuarioLogado";
import { SistemaSelecionadoProvider } from "@/presentation/ui/features/sistemas/SistemaSelecionadoContext";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: usuario, isLoading, isError } = useUsuarioLogado();

  useEffect(() => {
    if (!isLoading && (isError || !usuario)) {
      router.replace("/login");
    }
  }, [isLoading, isError, usuario, router]);

  if (isLoading || !usuario) {
    return <div className="flex min-h-screen items-center justify-center bg-background" />;
  }

  return (
    <SistemaSelecionadoProvider>
      <div className="flex h-screen flex-col bg-background">
        <AppHeader usuario={usuario} />
        <main className="min-h-0 flex-1">{children}</main>
      </div>
    </SistemaSelecionadoProvider>
  );
}
