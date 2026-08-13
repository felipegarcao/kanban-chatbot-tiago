"use client";

import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { Field } from "@/presentation/ui/components/Field";
import { ErrorState } from "@/presentation/ui/components/ErrorState";
import { Skeleton } from "@/presentation/ui/components/Skeleton";
import { ConversaDrawer } from "./ConversaDrawer";
import { KanbanColuna } from "./KanbanColuna";
import { useColunas } from "./useColunas";
import { useContagens } from "./useContagens";
import { useMoverConversa } from "./useMoverConversa";
import type { ConversaResumo } from "./types";
import type { StatusConversa } from "@/core/domain/Conversa";

export function KanbanBoard({ sistemaId }: { sistemaId: number }) {
  const [busca, setBusca] = useState("");
  const [conversaSelecionadaId, setConversaSelecionadaId] = useState<number | null>(null);
  const [erroMovimento, setErroMovimento] = useState<string | null>(null);
  const colunas = useColunas(sistemaId);
  const contagens = useContagens(sistemaId);
  const mover = useMoverConversa(sistemaId, busca);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    if (!erroMovimento) return;
    const timer = setTimeout(() => setErroMovimento(null), 5000);
    return () => clearTimeout(timer);
  }, [erroMovimento]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const conversa = active.data.current?.conversa as ConversaResumo | undefined;
    const novoStatus = over.id as StatusConversa;
    if (!conversa || conversa.status === novoStatus) return;

    mover.mutate(
      { conversa, novoStatus },
      {
        onError: () => setErroMovimento("Não foi possível mover a conversa. Ela voltou pro lugar."),
      },
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="max-w-xs flex-1">
            <Field
              label="Buscar"
              type="search"
              placeholder="Nome ou telefone"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Buscar conversas por nome ou telefone"
            />
          </div>
          {erroMovimento && (
            <p role="alert" className="text-sm text-critical">
              {erroMovimento}
            </p>
          )}
        </div>

        {colunas.isPending && (
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-96 w-80 shrink-0" />
            ))}
          </div>
        )}

        {colunas.isError && (
          <ErrorState mensagem="Não foi possível carregar as colunas do quadro." aoTentarNovamente={() => colunas.refetch()} />
        )}

        {colunas.isSuccess && (
          <div className="flex flex-1 gap-3 overflow-x-auto pb-2">
            {colunas.data.map((coluna) => (
              <KanbanColuna
                key={coluna.id}
                sistemaId={sistemaId}
                coluna={coluna}
                busca={busca}
                total={contagens.data?.[coluna.chave]}
                onSelecionarConversa={setConversaSelecionadaId}
              />
            ))}
          </div>
        )}

        {conversaSelecionadaId !== null && (
          <ConversaDrawer conversaId={conversaSelecionadaId} onFechar={() => setConversaSelecionadaId(null)} />
        )}
      </div>
    </DndContext>
  );
}
