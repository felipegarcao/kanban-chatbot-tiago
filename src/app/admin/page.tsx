"use client";

import Link from "next/link";
import { Badge } from "@/presentation/ui/components/Badge";
import { DataList } from "@/presentation/ui/components/DataList";
import { ErrorState } from "@/presentation/ui/components/ErrorState";
import { Skeleton } from "@/presentation/ui/components/Skeleton";
import { useProjetos } from "@/presentation/ui/features/sistemas/useProjetos";
import type { ProjetoResumo } from "@/presentation/ui/features/sistemas/types";

export default function AdminProjetosPage() {
  const projetos = useProjetos();

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
          ]}
          renderCard={(p: ProjetoResumo) => (
            <Link
              key={p.id}
              href={`/admin/projetos/${p.id}/editar`}
              className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{p.nome}</span>
                <Badge tom={p.ativo ? "acento" : "neutro"}>{p.ativo ? "Ativo" : "Inativo"}</Badge>
              </div>
              {p.descricao && <span className="text-xs text-muted">{p.descricao}</span>}
            </Link>
          )}
        />
      )}
    </div>
  );
}
