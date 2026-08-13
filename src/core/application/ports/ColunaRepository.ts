import type { StatusConversa } from "@/core/domain/Conversa";

export interface Coluna {
  id: number;
  sistemaId: number;
  chave: StatusConversa;
  titulo: string;
  cor: string;
  ordem: number;
  visivel: boolean;
}

export interface ConfiguracaoColuna {
  chave: StatusConversa;
  titulo: string;
  cor: string;
  ordem: number;
  visivel: boolean;
}

export interface ColunaRepository {
  listarPorProjeto(sistemaId: number, apenasVisiveis: boolean): Promise<Coluna[]>;
  configurar(sistemaId: number, colunas: readonly ConfiguracaoColuna[]): Promise<void>;
  /** Insere as raias padrão para um projeto novo (idempotente: ON CONFLICT DO NOTHING). */
  inserirPadrao(sistemaId: number, colunas: readonly ConfiguracaoColuna[]): Promise<void>;
}
