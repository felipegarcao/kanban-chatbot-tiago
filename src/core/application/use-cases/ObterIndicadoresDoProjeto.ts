import { garantirAcessoAoProjeto } from "@/core/domain/permissoes";
import type { Clock } from "@/core/application/ports/Clock";
import type { Indicadores, IndicadoresRepository } from "@/core/application/ports/IndicadoresRepository";
import { intervaloPadrao } from "@/core/application/intervaloDeDatas";

export interface ObterIndicadoresDoProjetoInput {
  sistemaId: number;
  sistemasPermitidos: number[];
  dataInicio?: Date;
  dataFim?: Date;
}

export class ObterIndicadoresDoProjeto {
  constructor(
    private readonly indicadores: IndicadoresRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: ObterIndicadoresDoProjetoInput): Promise<Indicadores> {
    garantirAcessoAoProjeto(input.sistemaId, input.sistemasPermitidos);
    const padrao = intervaloPadrao(this.clock);
    return this.indicadores.obter(
      input.sistemaId,
      input.dataInicio ?? padrao.dataInicio,
      input.dataFim ?? padrao.dataFim,
    );
  }
}
