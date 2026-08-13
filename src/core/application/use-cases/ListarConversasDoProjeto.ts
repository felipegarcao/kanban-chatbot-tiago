import { garantirAcessoAoProjeto } from "@/core/domain/permissoes";
import type { Clock } from "@/core/application/ports/Clock";
import type { ConversaRepository, PaginaConversas } from "@/core/application/ports/ConversaRepository";
import { intervaloPadrao } from "@/core/application/intervaloDeDatas";
import type { StatusConversa } from "@/core/domain/Conversa";

export interface ListarConversasDoProjetoInput {
  sistemaId: number;
  sistemasPermitidos: number[];
  status?: StatusConversa;
  busca?: string;
  cursor?: string | null;
  limite?: number;
  dataInicio?: Date;
  dataFim?: Date;
}

const LIMITE_PADRAO = 20;

export class ListarConversasDoProjeto {
  constructor(
    private readonly conversas: ConversaRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: ListarConversasDoProjetoInput): Promise<PaginaConversas> {
    garantirAcessoAoProjeto(input.sistemaId, input.sistemasPermitidos);
    const padrao = intervaloPadrao(this.clock);

    return this.conversas.listarPorProjeto({
      sistemaId: input.sistemaId,
      status: input.status,
      busca: input.busca,
      cursor: input.cursor ?? null,
      limite: input.limite ?? LIMITE_PADRAO,
      dataInicio: input.dataInicio ?? padrao.dataInicio,
      dataFim: input.dataFim ?? padrao.dataFim,
    });
  }
}
