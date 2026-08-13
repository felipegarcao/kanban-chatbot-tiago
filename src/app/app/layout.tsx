"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/presentation/ui/components/AppShell";
import { useUsuarioLogado } from "@/presentation/ui/features/auth/useUsuarioLogado";

export default function AppRouteLayout({ children }: { children: React.ReactNode }) {
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

  return <AppShell usuario={usuario}>{children}</AppShell>;
}
