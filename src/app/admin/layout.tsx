"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/presentation/ui/components/Button";
import { useLogout } from "@/presentation/ui/features/auth/useLogout";
import { useUsuarioLogado } from "@/presentation/ui/features/auth/useUsuarioLogado";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useLogout();
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
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-4 border-b border-border bg-surface px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Painel de Conversas · Admin</span>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/admin" className={pathname === "/admin" ? "text-accent" : "text-muted hover:text-foreground"}>
            Projetos
          </Link>
          <Link
            href="/admin/usuarios"
            className={pathname === "/admin/usuarios" ? "text-accent" : "text-muted hover:text-foreground"}
          >
            Usuários
          </Link>
        </nav>
        <div className="flex-1" />
        <Link href="/app" className="text-sm text-muted hover:text-foreground">
          Voltar ao painel
        </Link>
        <Button variante="ghost" onClick={() => logout.mutate()} carregando={logout.isPending}>
          Sair
        </Button>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
