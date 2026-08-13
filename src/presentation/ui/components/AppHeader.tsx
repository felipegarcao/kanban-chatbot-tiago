"use client";

import { Button } from "@/presentation/ui/components/Button";
import { SistemaSelector } from "@/presentation/ui/components/SistemaSelector";
import { useLogout } from "@/presentation/ui/features/auth/useLogout";
import type { UsuarioSessao } from "@/presentation/ui/features/auth/types";

export function AppHeader({ usuario }: { usuario: UsuarioSessao }) {
  const logout = useLogout();

  return (
    <header className="flex items-center gap-4 border-b border-border bg-surface px-4 py-3">
      <span className="text-sm font-semibold text-foreground">Painel de Conversas</span>
      <SistemaSelector />
      <div className="flex-1" />
      {usuario.papel === "admin" && (
        <a href="/admin" className="text-sm text-muted hover:text-foreground">
          Admin
        </a>
      )}
      <span className="text-sm text-muted">{usuario.nome}</span>
      <Button variante="ghost" onClick={() => logout.mutate()} carregando={logout.isPending}>
        Sair
      </Button>
    </header>
  );
}
