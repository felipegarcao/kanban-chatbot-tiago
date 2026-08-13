import type { PrioridadeConversa, StatusConversa } from "@/core/domain/Conversa";

export interface DistribuicaoPorStatus {
  status: StatusConversa;
  total: number;
}

export interface DistribuicaoPorPrioridade {
  prioridade: PrioridadeConversa;
  total: number;
}

export interface VolumeDoDia {
  data: string; // YYYY-MM-DD
  total: number;
}

export interface DesempenhoOperador {
  usuarioId: number;
  nome: string;
  assumidas: number;
  resolvidas: number;
}

export interface Indicadores {
  totalConversas: number;
  conversasResolvidas: number;
  conversasCriticas: number;
  valorTotalConfirmado: number;
  /** null quando nenhuma conversa do período tem os dois marcos (assumida_em e evento de resolução) pra medir. */
  tempoMedioAtendimentoMinutos: number | null;
  distribuicaoPorStatus: DistribuicaoPorStatus[];
  distribuicaoPorPrioridade: DistribuicaoPorPrioridade[];
  volumePorDia: VolumeDoDia[];
  porOperador: DesempenhoOperador[];
}

export interface IndicadoresRepository {
  obter(sistemaId: number, dataInicio: Date, dataFim: Date): Promise<Indicadores>;
}
