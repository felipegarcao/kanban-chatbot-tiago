import { ProjetoNaoEncontrado } from "@/core/domain/errors/DomainError";
import { garantirAdmin } from "@/core/domain/permissoes";
import type { ProjetoRepository } from "@/core/application/ports/ProjetoRepository";
import type { Papel } from "@/core/domain/Usuario";

export interface AtivarDesativarProjetoInput {
  papel: Papel;
  sistemaId: number;
  ativo: boolean;
}

export class AtivarDesativarProjeto {
  constructor(private readonly projetos: ProjetoRepository) {}

  async execute(input: AtivarDesativarProjetoInput): Promise<void> {
    garantirAdmin(input.papel);
    const projeto = await this.projetos.buscarPorId(input.sistemaId);
    if (!projeto) {
      throw new ProjetoNaoEncontrado(input.sistemaId);
    }
    if (input.ativo) {
      projeto.ativar();
    } else {
      projeto.desativar();
    }
    await this.projetos.salvar(projeto);
  }
}
