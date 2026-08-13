import { ProjetoNaoEncontrado } from "@/core/domain/errors/DomainError";
import { garantirAdmin } from "@/core/domain/permissoes";
import type { ProjetoRepository } from "@/core/application/ports/ProjetoRepository";
import type { Papel } from "@/core/domain/Usuario";

export interface EditarProjetoInput {
  papel: Papel;
  sistemaId: number;
  nome?: string;
  descricao?: string | null;
}

export class EditarProjeto {
  constructor(private readonly projetos: ProjetoRepository) {}

  async execute(input: EditarProjetoInput): Promise<void> {
    garantirAdmin(input.papel);
    const projeto = await this.projetos.buscarPorId(input.sistemaId);
    if (!projeto) {
      throw new ProjetoNaoEncontrado(input.sistemaId);
    }
    projeto.renomear(input.nome ?? projeto.nome, input.descricao !== undefined ? input.descricao : projeto.descricao);
    await this.projetos.salvar(projeto);
  }
}
