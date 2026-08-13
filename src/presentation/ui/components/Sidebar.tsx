"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/presentation/ui/components/Button";
import { SistemaSelector } from "@/presentation/ui/components/SistemaSelector";
import { useLogout } from "@/presentation/ui/features/auth/useLogout";
import type { UsuarioSessao } from "@/presentation/ui/features/auth/types";

interface ItemNav {
  href: string;
  rotulo: string;
  somenteAdmin?: boolean;
}

const ITENS_NAV: ItemNav[] = [
  { href: "/app", rotulo: "Conversas" },
  { href: "/admin", rotulo: "Projetos", somenteAdmin: true },
  { href: "/admin/usuarios", rotulo: "Usuários", somenteAdmin: true },
];

export function Sidebar({ usuario, onNavegar }: { usuario: UsuarioSessao; onNavegar?: () => void }) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-surface">
      <div className="px-4 py-4">
        <span className="text-sm font-semibold text-foreground">Painel de Conversas</span>
      </div>

      <div className="px-3">
        <SistemaSelector />
      </div>

      <nav className="mt-4 flex flex-col gap-0.5 px-2">
        {ITENS_NAV.filter((item) => !item.somenteAdmin || usuario.papel === "admin").map((item) => {
          const ativo = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavegar}
              className={`flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium transition-colors ${
                ativo ? "bg-accent/15 text-accent" : "text-muted hover:bg-border/40 hover:text-foreground"
              }`}
            >
              {item.rotulo}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-2 border-t border-border p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{usuario.nome}</p>
          <p className="truncate text-xs text-muted">{usuario.papel === "admin" ? "Admin" : "Operador"}</p>
        </div>
        <Button variante="ghost" onClick={() => logout.mutate()} carregando={logout.isPending}>
          Sair
        </Button>
      </div>
    </div>
  );
}
