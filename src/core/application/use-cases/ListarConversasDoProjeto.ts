import { garantirAcessoAoProjeto } from "@/core/domain/permissoes";
import type { ConversaRepository, PaginaConversas } from "@/core/application/ports/ConversaRepository";
import type { StatusConversa } from "@/core/domain/Conversa";

export interface ListarConversasDoProjetoInput {
  sistemaId: number;
  sistemasPermitidos: number[];
  status?: StatusConversa;
  busca?: string;
  cursor?: string | null;
  limite?: number;
}

const LIMITE_PADRAO = 20;

export class ListarConversasDoProjeto {
  constructor(private readonly conversas: ConversaRepository) {}

  async execute(input: ListarConversasDoProjetoInput): Promise<PaginaConversas> {
    garantirAcessoAoProjeto(input.sistemaId, input.sistemasPermitidos);
    return this.conversas.listarPorProjeto({
      sistemaId: input.sistemaId,
      status: input.status,
      busca: input.busca,
      cursor: input.cursor ?? null,
      limite: input.limite ?? LIMITE_PADRAO,
    });
  }
}
