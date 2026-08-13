import type { Clock } from "./ports/Clock";

export interface IntervaloDeDatas {
  dataInicio: Date;
  dataFim: Date;
}

const DIAS_PADRAO = 30;

/**
 * Intervalo padrão quando o chamador não informa um: últimos 30 dias até agora. Vale tanto
 * pro filtro do kanban quanto pros indicadores — defesa em profundidade: mesmo batendo direto
 * na API sem parâmetros, nunca se cai num "todo o histórico" sem querer.
 */
export function intervaloPadrao(clock: Clock): IntervaloDeDatas {
  const dataFim = clock.agora();
  const dataInicio = new Date(dataFim);
  dataInicio.setDate(dataInicio.getDate() - DIAS_PADRAO);
  return { dataInicio, dataFim };
}
