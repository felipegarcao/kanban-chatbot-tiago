"use client";

import { CheckCircle2, Clock, MessagesSquare, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { DateRangeFilter } from "@/presentation/ui/components/DateRangeFilter";
import { ErrorState } from "@/presentation/ui/components/ErrorState";
import { Skeleton } from "@/presentation/ui/components/Skeleton";
import { intervaloPadrao } from "@/presentation/ui/lib/dateRange";
import { ehErroDePermissao } from "@/presentation/ui/lib/httpClient";
import { BarraHorizontal, type ItemBarra } from "./BarraHorizontal";
import { ChartCard } from "./ChartCard";
import { formatarDuracao, formatarNumero, formatarPercentual } from "./formatadores";
import { GraficoLinha } from "./GraficoLinha";
import { GraficoOperadores } from "./GraficoOperadores";
import { COR_PRIORIDADE, COR_STATUS, ORDEM_STATUS, ROTULO_PRIORIDADE, ROTULO_STATUS } from "./rotulos";
import { StatCard } from "./StatCard";
import { useIndicadores } from "./useIndicadores";

export function IndicadoresPainel({ sistemaId }: { sistemaId: number }) {
  const [intervalo, setIntervalo] = useState(intervaloPadrao);
  const indicadores = useIndicadores(sistemaId, intervalo);

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-foreground">Indicadores</h1>
        <DateRangeFilter value={intervalo} onChange={setIntervalo} />
      </div>

      {indicadores.isPending && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}

      {indicadores.isError && !ehErroDePermissao(indicadores.error) && (
        <ErrorState mensagem="Não foi possível carregar os indicadores." aoTentarNovamente={() => indicadores.refetch()} />
      )}

      {indicadores.isSuccess && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard rotulo="Conversas no período" valor={formatarNumero(indicadores.data.totalConversas)} Icone={MessagesSquare} />
            <StatCard
              rotulo="Resolvidas"
              valor={formatarNumero(indicadores.data.conversasResolvidas)}
              subtitulo={`${formatarPercentual(indicadores.data.conversasResolvidas, indicadores.data.totalConversas)} do total`}
              Icone={CheckCircle2}
            />
            <StatCard
              rotulo="Críticas"
              valor={formatarNumero(indicadores.data.conversasCriticas)}
              tom={indicadores.data.conversasCriticas > 0 ? "critico" : "neutro"}
              Icone={TriangleAlert}
            />
            <StatCard
              rotulo="Tempo médio de atendimento"
              valor={formatarDuracao(indicadores.data.tempoMedioAtendimentoMinutos)}
              Icone={Clock}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard titulo="Distribuição por status" subtitulo="Conversas iniciadas no período, por status atual">
              <BarraHorizontal
                totalParaPercentual={indicadores.data.totalConversas}
                itens={itensDeStatus(indicadores.data.distribuicaoPorStatus)}
              />
            </ChartCard>

            <ChartCard titulo="Distribuição por prioridade" subtitulo="Conversas iniciadas no período">
              <BarraHorizontal
                totalParaPercentual={indicadores.data.totalConversas}
                itens={indicadores.data.distribuicaoPorPrioridade.map((p) => ({
                  chave: p.prioridade,
                  rotulo: ROTULO_PRIORIDADE[p.prioridade],
                  valor: p.total,
                  cor: COR_PRIORIDADE[p.prioridade],
                }))}
              />
            </ChartCard>

            <ChartCard titulo="Volume por dia" subtitulo="Conversas iniciadas por dia no período">
              <GraficoLinha pontos={indicadores.data.volumePorDia} titulo="Volume de conversas por dia" />
            </ChartCard>

            <ChartCard titulo="Desempenho por operador" subtitulo="Top 10 no período, por conversas assumidas + resolvidas">
              <GraficoOperadores operadores={indicadores.data.porOperador} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

function itensDeStatus(distribuicao: { status: string; total: number }[]): ItemBarra[] {
  const totais = new Map(distribuicao.map((d) => [d.status, d.total]));
  return ORDEM_STATUS.map((status) => ({
    chave: status,
    rotulo: ROTULO_STATUS[status],
    valor: totais.get(status) ?? 0,
    cor: COR_STATUS[status],
  })).filter((item) => item.valor > 0);
}
