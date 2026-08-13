import { garantirAcessoAoProjeto } from "@/core/domain/permissoes";
import type { Coluna } from "@/core/application/ports/ColunaRepository";
import type { ColunaRepository } from "@/core/application/ports/ColunaRepository";

export interface ListarColunasDoProjetoInput {
  sistemaId: number;
  sistemasPermitidos: number[];
  /** Admin configurando raias precisa ver as ocultas também; o kanban normal só vê as visíveis. */
  apenasVisiveis?: boolean;
}

export class ListarColunasDoProjeto {
  constructor(private readonly colunas: ColunaRepository) {}

  async execute(input: ListarColunasDoProjetoInput): Promise<Coluna[]> {
    garantirAcessoAoProjeto(input.sistemaId, input.sistemasPermitidos);
    return this.colunas.listarPorProjeto(input.sistemaId, input.apenasVisiveis ?? true);
  }
}
