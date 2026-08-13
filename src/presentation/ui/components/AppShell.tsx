"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "@/presentation/ui/components/Sidebar";
import type { UsuarioSessao } from "@/presentation/ui/features/auth/types";

export function AppShell({ usuario, children }: { usuario: UsuarioSessao; children: React.ReactNode }) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden h-full md:block">
        <Sidebar usuario={usuario} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border bg-surface px-3 py-2.5 md:hidden">
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-foreground hover:bg-border/40"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <span className="text-sm font-semibold text-foreground">Painel de Conversas</span>
        </div>

        <main className="min-h-0 flex-1">{children}</main>
      </div>

      {menuAberto && (
        <div className="fixed inset-0 z-50 flex md:hidden" onClick={() => setMenuAberto(false)}>
          <div className="h-full" onClick={(e) => e.stopPropagation()}>
            <Sidebar usuario={usuario} onNavegar={() => setMenuAberto(false)} />
          </div>
          <div className="flex-1 bg-black/40" />
        </div>
      )}
    </div>
  );
}
