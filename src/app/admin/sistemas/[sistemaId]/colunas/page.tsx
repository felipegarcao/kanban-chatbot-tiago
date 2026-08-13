"use client";

import { use, useState } from "react";
import { ArrowLeft, GripVertical, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/presentation/ui/components/Button";
import { Skeleton } from "@/presentation/ui/components/Skeleton";
import { ErrorState } from "@/presentation/ui/components/ErrorState";
import { useColunasAdmin, useConfigurarColunas } from "@/presentation/ui/features/admin/useColunasAdmin";
import type { ColunaResumo } from "@/presentation/ui/features/kanban/types";

export default function AdminColunasPage({ params }: { params: Promise<{ sistemaId: string }> }) {
  const { sistemaId: sistemaIdParam } = use(params);
  const sistemaId = Number(sistemaIdParam);
  const colunas = useColunasAdmin(sistemaId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link
        href={`/admin/projetos/${sistemaId}/editar`}
        className="inline-flex w-fit items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={15} aria-hidden="true" /> Voltar ao projeto
      </Link>
      <div>
        <h1 className="text-lg font-semibold text-foreground">Raias do quadro</h1>
        <p className="mt-0.5 text-sm text-muted">
          A chave de cada raia é fixa (contrato com o banco). Só rótulo, cor, ordem e visibilidade são configuráveis.
        </p>
      </div>

      {colunas.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}

      {colunas.isError && (
        <ErrorState mensagem="Não foi possível carregar as raias." aoTentarNovamente={() => colunas.refetch()} />
      )}

      {colunas.isSuccess && <EditorDeColunas key={sistemaId} sistemaId={sistemaId} colunasIniciais={colunas.data} />}
    </div>
  );
}

function EditorDeColunas({ sistemaId, colunasIniciais }: { sistemaId: number; colunasIniciais: ColunaResumo[] }) {
  const [rascunho, setRascunho] = useState<ColunaResumo[]>(colunasIniciais);
  const configurar = useConfigurarColunas(sistemaId);

  function atualizar(id: number, patch: Partial<ColunaResumo>) {
    setRascunho((atual) => atual.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-2 shadow-sm">
        {rascunho
          .slice()
          .sort((a, b) => a.ordem - b.ordem)
          .map((coluna) => (
            <div key={coluna.id} className="flex flex-wrap items-center gap-2 rounded-lg p-1.5">
              <GripVertical size={15} className="shrink-0 text-muted" aria-hidden="true" />
              <input
                type="color"
                value={coluna.cor}
                onChange={(e) => atualizar(coluna.id, { cor: e.target.value })}
                aria-label={`Cor da raia ${coluna.titulo}`}
                className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-border"
              />
              <input
                value={coluna.titulo}
                onChange={(e) => atualizar(coluna.id, { titulo: e.target.value })}
                aria-label={`Título da raia ${coluna.chave}`}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground
                  focus-visible:outline-2 focus-visible:outline-ring"
              />
              <input
                type="number"
                value={coluna.ordem}
                onChange={(e) => atualizar(coluna.id, { ordem: Number(e.target.value) })}
                aria-label={`Ordem da raia ${coluna.titulo}`}
                className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground
                  focus-visible:outline-2 focus-visible:outline-ring"
              />
              <label className="flex items-center gap-1.5 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={coluna.visivel}
                  onChange={(e) => atualizar(coluna.id, { visivel: e.target.checked })}
                  className="h-4 w-4 accent-accent"
                />
                Visível
              </label>
              <code className="rounded bg-border/40 px-1.5 py-0.5 text-xs text-muted">{coluna.chave}</code>
            </div>
          ))}
      </div>

      <Button onClick={() => configurar.mutate(rascunho)} carregando={configurar.isPending} icone={Save} className="self-start">
        Salvar raias
      </Button>
    </div>
  );
}
