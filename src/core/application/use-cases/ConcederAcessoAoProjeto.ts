import { ProjetoNaoEncontrado } from "@/core/domain/errors/DomainError";
import { garantirAdmin } from "@/core/domain/permissoes";
import type { ProjetoRepository } from "@/core/application/ports/ProjetoRepository";
import type { UsuarioSistemaRepository } from "@/core/application/ports/UsuarioSistemaRepository";
import type { Papel } from "@/core/domain/Usuario";

export interface ConcederAcessoAoProjetoInput {
  papel: Papel;
  usuarioId: number;
  sistemaId: number;
}

export class ConcederAcessoAoProjeto {
  constructor(
    private readonly projetos: ProjetoRepository,
    private readonly usuarioSistemas: UsuarioSistemaRepository,
  ) {}

  async execute(input: ConcederAcessoAoProjetoInput): Promise<void> {
    garantirAdmin(input.papel);
    const projeto = await this.projetos.buscarPorId(input.sistemaId);
    if (!projeto) {
      throw new ProjetoNaoEncontrado(input.sistemaId);
    }
    await this.usuarioSistemas.conceder(input.usuarioId, input.sistemaId);
  }
}
