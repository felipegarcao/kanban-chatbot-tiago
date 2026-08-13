"use client";

import { use, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
          A chave de cada raia é fixa (contrato com o banco). Arraste pelo ícone para reordenar; rótulo, cor e
          visibilidade também são configuráveis.
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

      {colunas.isSuccess && (
        <EditorDeColunas
          key={sistemaId}
          sistemaId={sistemaId}
          colunasIniciais={colunas.data.slice().sort((a, b) => a.ordem - b.ordem)}
        />
      )}
    </div>
  );
}

function EditorDeColunas({ sistemaId, colunasIniciais }: { sistemaId: number; colunasIniciais: ColunaResumo[] }) {
  const [ordenadas, setOrdenadas] = useState<ColunaResumo[]>(colunasIniciais);
  const configurar = useConfigurarColunas(sistemaId);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function atualizar(id: number, patch: Partial<ColunaResumo>) {
    setOrdenadas((atual) => atual.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrdenadas((atual) => {
      const de = atual.findIndex((c) => c.id === active.id);
      const para = atual.findIndex((c) => c.id === over.id);
      if (de === -1 || para === -1) return atual;
      return arrayMove(atual, de, para);
    });
  }

  function handleSalvar() {
    const comOrdemRecalculada = ordenadas.map((coluna, indice) => ({ ...coluna, ordem: indice }));
    configurar.mutate(comOrdemRecalculada);
  }

  return (
    <div className="flex flex-col gap-4">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={ordenadas.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-2 shadow-sm">
            {ordenadas.map((coluna) => (
              <LinhaColuna key={coluna.id} coluna={coluna} onAtualizar={(patch) => atualizar(coluna.id, patch)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button onClick={handleSalvar} carregando={configurar.isPending} icone={Save} className="self-start">
        Salvar raias
      </Button>
    </div>
  );
}

function LinhaColuna({
  coluna,
  onAtualizar,
}: {
  coluna: ColunaResumo;
  onAtualizar: (patch: Partial<ColunaResumo>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: coluna.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-wrap items-center gap-2 rounded-lg bg-surface p-1.5 ${isDragging ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Arrastar para reordenar ${coluna.titulo}`}
        className="flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted hover:bg-border/40 active:cursor-grabbing"
      >
        <GripVertical size={15} aria-hidden="true" />
      </button>
      <input
        type="color"
        value={coluna.cor}
        onChange={(e) => onAtualizar({ cor: e.target.value })}
        aria-label={`Cor da raia ${coluna.titulo}`}
        className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-border"
      />
      <input
        value={coluna.titulo}
        onChange={(e) => onAtualizar({ titulo: e.target.value })}
        aria-label={`Título da raia ${coluna.chave}`}
        className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground
          focus-visible:outline-2 focus-visible:outline-ring"
      />
      <label className="flex items-center gap-1.5 text-xs text-muted">
        <input
          type="checkbox"
          checked={coluna.visivel}
          onChange={(e) => onAtualizar({ visivel: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        Visível
      </label>
      <code className="rounded bg-border/40 px-1.5 py-0.5 text-xs text-muted">{coluna.chave}</code>
    </div>
  );
}
