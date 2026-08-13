"use client";

import Link from "next/link";
import { Badge } from "@/presentation/ui/components/Badge";
import { DataList } from "@/presentation/ui/components/DataList";
import { ErrorState } from "@/presentation/ui/components/ErrorState";
import { Skeleton } from "@/presentation/ui/components/Skeleton";
import { useUsuariosAdmin } from "@/presentation/ui/features/admin/useUsuariosAdmin";
import type { UsuarioAdmin } from "@/presentation/ui/features/admin/types";

export default function AdminUsuariosPage() {
  const usuarios = useUsuariosAdmin();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Usuários</h1>

      {usuarios.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {usuarios.isError && (
        <ErrorState mensagem="Não foi possível carregar os usuários." aoTentarNovamente={() => usuarios.refetch()} />
      )}

      {usuarios.isSuccess && (
        <DataList
          itens={usuarios.data}
          getId={(u) => u.id}
          buscarPlaceholder="Buscar por nome ou email"
          filtrar={(u, q) => u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)}
          novoHref="/admin/usuarios/novo"
          novoRotulo="Novo usuário"
          tituloVazio="Nenhum usuário ainda"
          colunas={[
            {
              header: "Nome",
              render: (u) => (
                <Link href={`/admin/usuarios/${u.id}/editar`} className="font-medium text-foreground hover:text-accent">
                  {u.nome}
                </Link>
              ),
            },
            { header: "Email", render: (u) => <span className="text-muted">{u.email}</span> },
            { header: "Papel", render: (u) => <span className="capitalize text-muted">{u.papel}</span> },
            {
              header: "Status",
              render: (u) => <Badge tom={u.ativo ? "acento" : "neutro"}>{u.ativo ? "Ativo" : "Inativo"}</Badge>,
            },
          ]}
          renderCard={(u: UsuarioAdmin) => (
            <Link
              key={u.id}
              href={`/admin/usuarios/${u.id}/editar`}
              className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{u.nome}</span>
                <Badge tom={u.ativo ? "acento" : "neutro"}>{u.ativo ? "Ativo" : "Inativo"}</Badge>
              </div>
              <span className="text-xs text-muted">{u.email}</span>
              <span className="text-xs capitalize text-muted">{u.papel}</span>
            </Link>
          )}
        />
      )}
    </div>
  );
}
