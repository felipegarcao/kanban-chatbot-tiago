import { ProjetoNaoEncontrado } from "@/core/domain/errors/DomainError";
import { garantirAdmin } from "@/core/domain/permissoes";
import type { ProjetoRepository } from "@/core/application/ports/ProjetoRepository";
import type { Papel } from "@/core/domain/Usuario";

export interface DeletarProjetoInput {
  papel: Papel;
  sistemaId: number;
}

/** Se o projeto tiver conversas reais, o repositório recusa (ProjetoPossuiConversas) — proteção deliberada. */
export class DeletarProjeto {
  constructor(private readonly projetos: ProjetoRepository) {}

  async execute(input: DeletarProjetoInput): Promise<void> {
    garantirAdmin(input.papel);
    const projeto = await this.projetos.buscarPorId(input.sistemaId);
    if (!projeto) {
      throw new ProjetoNaoEncontrado(input.sistemaId);
    }
    await this.projetos.deletar(input.sistemaId);
  }
}
