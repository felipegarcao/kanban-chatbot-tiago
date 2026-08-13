import { garantirAdmin } from "@/core/domain/permissoes";
import type { ColunaRepository, ConfiguracaoColuna } from "@/core/application/ports/ColunaRepository";
import type { Papel } from "@/core/domain/Usuario";

export interface ConfigurarColunasDoProjetoInput {
  papel: Papel;
  sistemaId: number;
  colunas: ConfiguracaoColuna[];
}

/**
 * Só rótulo, cor, ordem e visibilidade são configuráveis — `chave` é contrato com
 * `conversas.status` e não muda aqui (ver migration 3).
 */
export class ConfigurarColunasDoProjeto {
  constructor(private readonly colunas: ColunaRepository) {}

  async execute(input: ConfigurarColunasDoProjetoInput): Promise<void> {
    garantirAdmin(input.papel);
    await this.colunas.configurar(input.sistemaId, input.colunas);
  }
}
