import type { Projeto } from "@/core/domain/Projeto";

export interface NovoProjeto {
  nome: string;
  descricao: string | null;
}

export interface ProjetoRepository {
  buscarPorId(id: number): Promise<Projeto | null>;
  listar(): Promise<Projeto[]>;
  listarPorIds(ids: readonly number[]): Promise<Projeto[]>;
  criar(projeto: NovoProjeto): Promise<Projeto>;
  salvar(projeto: Projeto): Promise<void>;
  /** Lança ProjetoPossuiConversas se houver conversas referenciando o projeto (FK sem cascade, de propósito). */
  deletar(id: number): Promise<void>;
}
