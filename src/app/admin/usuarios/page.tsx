"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/presentation/ui/components/Badge";
import { ConfirmDialog } from "@/presentation/ui/components/ConfirmDialog";
import { DataList } from "@/presentation/ui/components/DataList";
import { ErrorState } from "@/presentation/ui/components/ErrorState";
import { Skeleton } from "@/presentation/ui/components/Skeleton";
import { useDeletarUsuario, useUsuariosAdmin } from "@/presentation/ui/features/admin/useUsuariosAdmin";
import type { UsuarioAdmin } from "@/presentation/ui/features/admin/types";

export default function AdminUsuariosPage() {
  const usuarios = useUsuariosAdmin();
  const deletar = useDeletarUsuario();
  const [paraExcluir, setParaExcluir] = useState<UsuarioAdmin | null>(null);

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
            {
              header: "",
              className: "w-0",
              render: (u) => (
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/usuarios/${u.id}/editar`}
                    aria-label={`Editar ${u.nome}`}
                    title="Editar"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-border/40 hover:text-foreground"
                  >
                    <Pencil size={15} aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    aria-label={`Excluir ${u.nome}`}
                    title="Excluir"
                    onClick={() => setParaExcluir(u)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-critical/10 hover:text-critical"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              ),
            },
          ]}
          renderCard={(u: UsuarioAdmin) => (
            <div key={u.id} className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface p-3">
              <div className="flex items-center justify-between gap-2">
                <Link href={`/admin/usuarios/${u.id}/editar`} className="text-sm font-medium text-foreground">
                  {u.nome}
                </Link>
                <Badge tom={u.ativo ? "acento" : "neutro"}>{u.ativo ? "Ativo" : "Inativo"}</Badge>
              </div>
              <span className="text-xs text-muted">{u.email}</span>
              <span className="text-xs capitalize text-muted">{u.papel}</span>
              <div className="mt-1 flex gap-2">
                <Link
                  href={`/admin/usuarios/${u.id}/editar`}
                  className="flex min-h-[36px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-border text-xs font-medium text-foreground"
                >
                  <Pencil size={13} aria-hidden="true" /> Editar
                </Link>
                <button
                  type="button"
                  onClick={() => setParaExcluir(u)}
                  className="flex min-h-[36px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-critical/30 text-xs font-medium text-critical"
                >
                  <Trash2 size={13} aria-hidden="true" /> Excluir
                </button>
              </div>
            </div>
          )}
        />
      )}

      {paraExcluir && (
        <ConfirmDialog
          titulo="Excluir usuário"
          mensagem={`Tem certeza que quer excluir "${paraExcluir.nome}"? Isso não pode ser desfeito.`}
          rotuloConfirmar="Excluir"
          confirmando={deletar.isPending}
          erro={deletar.error}
          onFechar={() => setParaExcluir(null)}
          onConfirmar={() =>
            deletar.mutate(paraExcluir.id, {
              onSuccess: () => setParaExcluir(null),
            })
          }
        />
      )}
    </div>
  );
}
