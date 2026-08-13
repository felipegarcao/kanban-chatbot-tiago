"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/presentation/ui/components/Badge";
import { ConfirmDialog } from "@/presentation/ui/components/ConfirmDialog";
import { DataList } from "@/presentation/ui/components/DataList";
import { ErrorState } from "@/presentation/ui/components/ErrorState";
import { Skeleton } from "@/presentation/ui/components/Skeleton";
import { useProjetos } from "@/presentation/ui/features/sistemas/useProjetos";
import { useDeletarProjeto } from "@/presentation/ui/features/sistemas/useDeletarProjeto";
import type { ProjetoResumo } from "@/presentation/ui/features/sistemas/types";

export default function AdminProjetosPage() {
  const projetos = useProjetos();
  const deletar = useDeletarProjeto();
  const [paraExcluir, setParaExcluir] = useState<ProjetoResumo | null>(null);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Projetos</h1>

      {projetos.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {projetos.isError && (
        <ErrorState mensagem="Não foi possível carregar os projetos." aoTentarNovamente={() => projetos.refetch()} />
      )}

      {projetos.isSuccess && (
        <DataList
          itens={projetos.data}
          getId={(p) => p.id}
          buscarPlaceholder="Buscar por nome"
          filtrar={(p, q) => p.nome.toLowerCase().includes(q) || (p.descricao ?? "").toLowerCase().includes(q)}
          novoHref="/admin/projetos/novo"
          novoRotulo="Novo projeto"
          tituloVazio="Nenhum projeto ainda"
          colunas={[
            {
              header: "Nome",
              render: (p) => (
                <Link href={`/admin/projetos/${p.id}/editar`} className="font-medium text-foreground hover:text-accent">
                  {p.nome}
                </Link>
              ),
            },
            { header: "Descrição", render: (p) => <span className="text-muted">{p.descricao ?? "—"}</span> },
            {
              header: "Status",
              render: (p) => <Badge tom={p.ativo ? "acento" : "neutro"}>{p.ativo ? "Ativo" : "Inativo"}</Badge>,
            },
            {
              header: "",
              className: "w-0",
              render: (p) => (
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/projetos/${p.id}/editar`}
                    aria-label={`Editar ${p.nome}`}
                    title="Editar"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-border/40 hover:text-foreground"
                  >
                    <Pencil size={15} aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    aria-label={`Excluir ${p.nome}`}
                    title="Excluir"
                    onClick={() => setParaExcluir(p)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-critical/10 hover:text-critical"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              ),
            },
          ]}
          renderCard={(p: ProjetoResumo) => (
            <div key={p.id} className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface p-3">
              <div className="flex items-center justify-between gap-2">
                <Link href={`/admin/projetos/${p.id}/editar`} className="text-sm font-medium text-foreground">
                  {p.nome}
                </Link>
                <Badge tom={p.ativo ? "acento" : "neutro"}>{p.ativo ? "Ativo" : "Inativo"}</Badge>
              </div>
              {p.descricao && <span className="text-xs text-muted">{p.descricao}</span>}
              <div className="mt-1 flex gap-2">
                <Link
                  href={`/admin/projetos/${p.id}/editar`}
                  className="flex min-h-[36px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-border text-xs font-medium text-foreground"
                >
                  <Pencil size={13} aria-hidden="true" /> Editar
                </Link>
                <button
                  type="button"
                  onClick={() => setParaExcluir(p)}
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
          titulo="Excluir projeto"
          mensagem={`Tem certeza que quer excluir "${paraExcluir.nome}"? Isso não pode ser desfeito. Se o projeto tiver conversas, a exclusão será recusada — desative-o em vez disso.`}
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
