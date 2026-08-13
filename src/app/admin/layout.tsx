"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/presentation/ui/components/AppShell";
import { useUsuarioLogado } from "@/presentation/ui/features/auth/useUsuarioLogado";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: usuario, isLoading } = useUsuarioLogado();

  useEffect(() => {
    if (!isLoading && (!usuario || usuario.papel !== "admin")) {
      router.replace("/app");
    }
  }, [isLoading, usuario, router]);

  if (isLoading || !usuario || usuario.papel !== "admin") {
    return <div className="flex min-h-screen items-center justify-center bg-background" />;
  }

  return (
    <AppShell usuario={usuario}>
      <div className="p-4">{children}</div>
    </AppShell>
  );
}
