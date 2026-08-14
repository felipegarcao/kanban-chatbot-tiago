"use client";

import { Menu, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Sidebar } from "@/presentation/ui/components/Sidebar";
import type { UsuarioSessao } from "@/presentation/ui/features/auth/types";

const CHAVE_SIDEBAR_ABERTA = "sidebarAberta";

export function AppShell({ usuario, children }: { usuario: UsuarioSessao; children: React.ReactNode }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [sidebarAberta, setSidebarAberta] = useState(true);

  useEffect(() => {
    const salvo = window.localStorage.getItem(CHAVE_SIDEBAR_ABERTA);
    if (salvo !== null) setSidebarAberta(salvo === "true");
  }, []);

  function alternarSidebar(aberta: boolean) {
    setSidebarAberta(aberta);
    window.localStorage.setItem(CHAVE_SIDEBAR_ABERTA, String(aberta));
  }

  return (
    <div className="flex h-screen bg-background">
      {sidebarAberta && (
        <div className="hidden h-full md:block">
          <Sidebar usuario={usuario} onFechar={() => alternarSidebar(false)} />
        </div>
      )}

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

        {!sidebarAberta && (
          <div className="hidden border-b border-border bg-surface px-3 py-2 md:block">
            <button
              type="button"
              onClick={() => alternarSidebar(true)}
              aria-label="Abrir menu lateral"
              title="Abrir menu lateral"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-border/40 hover:text-foreground"
            >
              <PanelLeftOpen size={18} aria-hidden="true" />
            </button>
          </div>
        )}

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
