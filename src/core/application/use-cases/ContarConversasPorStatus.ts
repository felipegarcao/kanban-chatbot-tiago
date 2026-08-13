import { garantirAcessoAoProjeto } from "@/core/domain/permissoes";
import type { ConversaRepository } from "@/core/application/ports/ConversaRepository";

export interface ContarConversasPorStatusInput {
  sistemaId: number;
  sistemasPermitidos: number[];
}

export class ContarConversasPorStatus {
  constructor(private readonly conversas: ConversaRepository) {}

  async execute(input: ContarConversasPorStatusInput): Promise<Record<string, number>> {
    garantirAcessoAoProjeto(input.sistemaId, input.sistemasPermitidos);
    return this.conversas.contarPorStatus(input.sistemaId);
  }
}
