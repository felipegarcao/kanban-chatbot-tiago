"use client";

import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/presentation/ui/components/Button";
import { DateRangeFilter } from "@/presentation/ui/components/DateRangeFilter";
import { Field } from "@/presentation/ui/components/Field";
import { PullToRefresh } from "@/presentation/ui/components/PullToRefresh";
import { CardSkeleton } from "@/presentation/ui/components/Skeleton";
import { EmptyState } from "@/presentation/ui/components/EmptyState";
import { ErrorState } from "@/presentation/ui/components/ErrorState";
import { intervaloPadrao, type IntervaloDeDatas } from "@/presentation/ui/lib/dateRange";
import { ehErroDePermissao } from "@/presentation/ui/lib/httpClient";
import type { StatusConversa } from "@/core/domain/Conversa";
import { ConversaDrawer } from "./ConversaDrawer";
import { MobileConversaCard } from "./MobileConversaCard";
import { useColunas } from "./useColunas";
import { useContagens } from "./useContagens";
import { useConversasDaColuna } from "./useConversasDaColuna";
import { useMoverConversa } from "./useMoverConversa";

export function MobileBoard({ sistemaId }: { sistemaId: number }) {
  const [busca, setBusca] = useState("");
  const [intervalo, setIntervalo] = useState(intervaloPadrao);
  const [conversaSelecionadaId, setConversaSelecionadaId] = useState<number | null>(null);
  const colunas = useColunas(sistemaId);
  const contagens = useContagens(sistemaId, intervalo);
  const [statusAtivo, setStatusAtivo] = useState<StatusConversa | null>(null);

  const chaveAtiva = statusAtivo ?? colunas.data?.[0]?.chave ?? null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-2 overflow-x-auto border-b border-border bg-surface px-2 py-2">
        {colunas.data?.map((coluna) => (
          <button
            key={coluna.id}
            type="button"
            onClick={() => setStatusAtivo(coluna.chave)}
            className={`flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium ${
              chaveAtiva === coluna.chave
                ? "border-accent bg-accent/15 text-accent"
                : "border-border bg-background text-muted"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: coluna.cor }} aria-hidden="true" />
            {coluna.titulo}
            <span className="text-xs">{contagens.data?.[coluna.chave] ?? "…"}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-b border-border bg-surface px-3 py-2">
        <Field
          label="Buscar"
          type="search"
          icone={Search}
          placeholder="Nome ou telefone"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar conversas por nome ou telefone"
        />
        <DateRangeFilter value={intervalo} onChange={setIntervalo} />
      </div>

      {chaveAtiva && (
        <ListaDaColuna
          sistemaId={sistemaId}
          status={chaveAtiva}
          busca={busca}
          intervalo={intervalo}
          onSelecionarConversa={setConversaSelecionadaId}
        />
      )}

      {conversaSelecionadaId !== null && (
        <ConversaDrawer conversaId={conversaSelecionadaId} onFechar={() => setConversaSelecionadaId(null)} />
      )}
    </div>
  );
}

function ListaDaColuna({
  sistemaId,
  status,
  busca,
  intervalo,
  onSelecionarConversa,
}: {
  sistemaId: number;
  status: StatusConversa;
  busca: string;
  intervalo: IntervaloDeDatas;
  onSelecionarConversa: (id: number) => void;
}) {
  const query = useConversasDaColuna(sistemaId, status, busca, intervalo);
  const mover = useMoverConversa(sistemaId, busca, intervalo);
  const conversas = query.data?.pages.flatMap((p) => p.itens) ?? [];

  return (
    <PullToRefresh onRefresh={() => query.refetch()}>
      <div className="flex flex-col gap-2 p-3">
        {query.isPending && Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}

        {query.isError && !ehErroDePermissao(query.error) && (
          <ErrorState mensagem="Não foi possível carregar as conversas." aoTentarNovamente={() => query.refetch()} />
        )}

        {query.isSuccess && conversas.length === 0 && (
          <EmptyState titulo="Nenhuma conversa aqui" descricao={busca ? "Nenhum resultado para a busca." : undefined} />
        )}

        {conversas.map((conversa) => (
          <MobileConversaCard
            key={conversa.id}
            conversa={conversa}
            onVerDetalhe={() => onSelecionarConversa(conversa.id)}
            onMover={(novoStatus) => mover.mutate({ conversa, novoStatus })}
          />
        ))}

        {query.hasNextPage && (
          <Button
            variante="secondary"
            icone={ChevronDown}
            carregando={query.isFetchingNextPage}
            onClick={() => query.fetchNextPage()}
          >
            Carregar mais
          </Button>
        )}
      </div>
    </PullToRefresh>
  );
}
