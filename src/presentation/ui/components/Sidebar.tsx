"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FolderKanban, LogOut, MessagesSquare, PanelLeftClose, Settings, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SistemaSelector } from "@/presentation/ui/components/SistemaSelector";
import { ThemeToggle } from "@/presentation/ui/components/ThemeToggle";
import { useLogout } from "@/presentation/ui/features/auth/useLogout";
import type { UsuarioSessao } from "@/presentation/ui/features/auth/types";

interface ItemNav {
  href: string;
  rotulo: string;
  Icone: LucideIcon;
  somenteAdmin?: boolean;
}

const ITENS_NAV: ItemNav[] = [
  { href: "/app", rotulo: "Conversas", Icone: MessagesSquare },
  { href: "/app/indicadores", rotulo: "Indicadores", Icone: BarChart3 },
  { href: "/admin", rotulo: "Projetos", Icone: FolderKanban, somenteAdmin: true },
  { href: "/admin/usuarios", rotulo: "Usuários", Icone: Users, somenteAdmin: true },
];

export function Sidebar({
  usuario,
  onNavegar,
  onFechar,
}: {
  usuario: UsuarioSessao;
  onNavegar?: () => void;
  onFechar?: () => void;
}) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2 px-4 py-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
          P
        </span>
        <span className="flex-1 text-sm font-semibold text-foreground">Painel de Conversas</span>
        {onFechar && (
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar menu lateral"
            title="Fechar menu lateral"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-border/40 hover:text-foreground"
          >
            <PanelLeftClose size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="px-3">
        <SistemaSelector />
      </div>

      <nav className="mt-4 flex flex-col gap-0.5 px-2">
        {(() => {
          const itensVisiveis = ITENS_NAV.filter((item) => !item.somenteAdmin || usuario.papel === "admin");
          // Rotas de admin são todas prefixadas por "/admin", então usar apenas `startsWith`
          // faz "Projetos" (/admin) ficar marcado como ativo junto de "Usuários" (/admin/usuarios).
          // Em vez disso, escolhe o item cujo href é o prefixo mais específico (mais longo) da rota atual.
          const hrefAtivo = itensVisiveis
            .filter((item) => (item.href === "/app" ? pathname === "/app" : pathname === item.href || pathname.startsWith(`${item.href}/`)))
            .sort((a, b) => b.href.length - a.href.length)[0]?.href;

          return itensVisiveis.map((item) => {
            const ativo = item.href === hrefAtivo;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavegar}
                aria-current={ativo ? "page" : undefined}
                className={`flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors ${
                  ativo ? "bg-accent/15 text-accent" : "text-muted hover:bg-border/40 hover:text-foreground"
                }`}
              >
                <item.Icone size={17} aria-hidden="true" />
                {item.rotulo}
              </Link>
            );
          });
        })()}
      </nav>

      <div className="flex-1" />

      <div className="flex flex-col gap-3 border-t border-border p-3">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-border/60 text-xs font-semibold text-foreground">
            {usuario.nome.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{usuario.nome}</p>
            <p className="truncate text-xs text-muted">{usuario.papel === "admin" ? "Admin" : "Operador"}</p>
          </div>
          <Link
            href="/app/perfil"
            onClick={onNavegar}
            aria-label="Meu perfil"
            title="Meu perfil"
            className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-muted transition-colors hover:bg-border/40 hover:text-foreground"
          >
            <Settings size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            aria-label="Sair"
            title="Sair"
            className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-muted transition-colors hover:bg-border/40 hover:text-critical disabled:opacity-50"
          >
            <LogOut size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
