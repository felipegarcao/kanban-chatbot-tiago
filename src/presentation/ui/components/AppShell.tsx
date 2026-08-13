"use client";

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
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-foreground hover:bg-border/40"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M2.5 5h15M2.5 10h15M2.5 15h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
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
