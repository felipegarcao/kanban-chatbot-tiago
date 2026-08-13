import type { ProjetoRepository } from "@/core/application/ports/ProjetoRepository";
import type { UsuarioSistemaRepository } from "@/core/application/ports/UsuarioSistemaRepository";
import type { Projeto } from "@/core/domain/Projeto";
import type { Papel } from "@/core/domain/Usuario";

export interface ListarProjetosInput {
  usuarioId: number;
  papel: Papel;
}

/** Admin vê todos os projetos (inclusive inativos, para a área admin). Operador vê só os permitidos e ativos (seletor do header). */
export class ListarProjetos {
  constructor(
    private readonly projetos: ProjetoRepository,
    private readonly usuarioSistemas: UsuarioSistemaRepository,
  ) {}

  async execute(input: ListarProjetosInput): Promise<Projeto[]> {
    if (input.papel === "admin") {
      return this.projetos.listar();
    }
    const sistemasPermitidos = await this.usuarioSistemas.listarSistemasPermitidos(input.usuarioId);
    const projetos = await this.projetos.listarPorIds(sistemasPermitidos);
    return projetos.filter((p) => p.ativo);
  }
}
