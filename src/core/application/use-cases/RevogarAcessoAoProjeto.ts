import { garantirAdmin } from "@/core/domain/permissoes";
import type { UsuarioSistemaRepository } from "@/core/application/ports/UsuarioSistemaRepository";
import type { Papel } from "@/core/domain/Usuario";

export interface RevogarAcessoAoProjetoInput {
  papel: Papel;
  usuarioId: number;
  sistemaId: number;
}

export class RevogarAcessoAoProjeto {
  constructor(private readonly usuarioSistemas: UsuarioSistemaRepository) {}

  async execute(input: RevogarAcessoAoProjetoInput): Promise<void> {
    garantirAdmin(input.papel);
    await this.usuarioSistemas.revogar(input.usuarioId, input.sistemaId);
  }
}
