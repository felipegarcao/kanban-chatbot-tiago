import { useDroppable } from "@dnd-kit/core";
import { ChevronDown } from "lucide-react";
import { Button } from "@/presentation/ui/components/Button";
import { CardSkeleton } from "@/presentation/ui/components/Skeleton";
import { EmptyState } from "@/presentation/ui/components/EmptyState";
import { ErrorState } from "@/presentation/ui/components/ErrorState";
import { ehErroDePermissao } from "@/presentation/ui/lib/httpClient";
import type { IntervaloDeDatas } from "@/presentation/ui/lib/dateRange";
import { ConversaCard } from "./ConversaCard";
import { useConversasDaColuna } from "./useConversasDaColuna";
import { useMoverConversa } from "./useMoverConversa";
import type { ColunaResumo } from "./types";
import type { StatusConversa } from "@/core/domain/Conversa";

interface KanbanColunaProps {
  sistemaId: number;
  coluna: ColunaResumo;
  busca: string;
  intervalo: IntervaloDeDatas;
  total: number | undefined;
  onSelecionarConversa: (conversaId: number) => void;
}

export function KanbanColuna({ sistemaId, coluna, busca, intervalo, total, onSelecionarConversa }: KanbanColunaProps) {
  const query = useConversasDaColuna(sistemaId, coluna.chave, busca, intervalo);
  const mover = useMoverConversa(sistemaId, busca, intervalo);
  const conversas = query.data?.pages.flatMap((p) => p.itens) ?? [];
  const { setNodeRef, isOver } = useDroppable({ id: coluna.chave });

  return (
    <div className="flex h-full w-80 shrink-0 flex-col rounded-xl border border-border bg-background shadow-sm">
      <div className="flex items-center gap-2 rounded-t-xl border-b border-border bg-surface px-3 py-2.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: coluna.cor }} aria-hidden="true" />
        <h2 className="flex-1 truncate text-sm font-semibold text-foreground">{coluna.titulo}</h2>
        <span className="rounded-full bg-border/60 px-2 py-0.5 text-xs font-medium text-muted">
          {total ?? "…"}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto overscroll-y-contain touch-pan-y p-2 transition-colors [-webkit-overflow-scrolling:touch] ${isOver ? "bg-accent/5" : ""}`}
      >
        <div className="flex flex-col gap-2">
          {query.isPending &&
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}

          {query.isError && !ehErroDePermissao(query.error) && (
            <ErrorState mensagem="Não foi possível carregar as conversas." aoTentarNovamente={() => query.refetch()} />
          )}

          {query.isSuccess && conversas.length === 0 && (
            <EmptyState titulo="Nenhuma conversa aqui" descricao={busca ? "Nenhum resultado para a busca." : undefined} />
          )}

          {conversas.map((conversa) => (
            <ConversaCard
              key={conversa.id}
              conversa={conversa}
              onClick={() => onSelecionarConversa(conversa.id)}
              onMover={(novoStatus: StatusConversa) => mover.mutate({ conversa, novoStatus })}
              movendo={mover.isPending && mover.variables?.conversa.id === conversa.id}
            />
          ))}

          {query.hasNextPage && (
            <Button
              variante="secondary"
              icone={ChevronDown}
              className="mt-1 w-full"
              carregando={query.isFetchingNextPage}
              onClick={() => query.fetchNextPage()}
            >
              Carregar mais
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
