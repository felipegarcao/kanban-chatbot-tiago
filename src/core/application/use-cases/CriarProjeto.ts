import { garantirAdmin } from "@/core/domain/permissoes";
import type { ColunaRepository, ConfiguracaoColuna } from "@/core/application/ports/ColunaRepository";
import type { ProjetoRepository } from "@/core/application/ports/ProjetoRepository";
import type { UsuarioSistemaRepository } from "@/core/application/ports/UsuarioSistemaRepository";
import type { Projeto } from "@/core/domain/Projeto";
import type { StatusConversa } from "@/core/domain/Conversa";
import type { Papel } from "@/core/domain/Usuario";

export interface CriarProjetoInput {
  papel: Papel;
  usuarioId: number;
  nome: string;
  descricao: string | null;
}

/** Mesmas 6 raias e ordem da migration 3 (seed para os projetos que já existiam). */
export const COLUNAS_PADRAO: ReadonlyArray<ConfiguracaoColuna> = [
  { chave: "ativa" as StatusConversa, titulo: "Ativa", cor: "#6366f1", ordem: 0, visivel: true },
  { chave: "aguardando_humano" as StatusConversa, titulo: "Aguardando humano", cor: "#f59e0b", ordem: 1, visivel: true },
  { chave: "em_atendimento" as StatusConversa, titulo: "Em atendimento", cor: "#0ea5e9", ordem: 2, visivel: true },
  { chave: "aguardando_cliente" as StatusConversa, titulo: "Aguardando cliente", cor: "#a855f7", ordem: 3, visivel: true },
  { chave: "aguardando_financeiro" as StatusConversa, titulo: "Aguardando financeiro", cor: "#22c55e", ordem: 4, visivel: true },
  { chave: "resolvida" as StatusConversa, titulo: "Resolvida", cor: "#64748b", ordem: 5, visivel: true },
];

export class CriarProjeto {
  constructor(
    private readonly projetos: ProjetoRepository,
    private readonly colunas: ColunaRepository,
    private readonly usuarioSistemas: UsuarioSistemaRepository,
  ) {}

  async execute(input: CriarProjetoInput): Promise<Projeto> {
    garantirAdmin(input.papel);
    const projeto = await this.projetos.criar({ nome: input.nome, descricao: input.descricao });
    await this.colunas.inserirPadrao(projeto.id, COLUNAS_PADRAO);
    // Quem cria o projeto já sai com acesso a ele — senão o próprio admin toma 403 ao tentar configurá-lo em seguida.
    await this.usuarioSistemas.conceder(input.usuarioId, projeto.id);
    return projeto;
  }
}
