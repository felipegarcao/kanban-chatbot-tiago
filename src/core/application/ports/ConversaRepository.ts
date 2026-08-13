import type { Conversa, StatusConversa } from "@/core/domain/Conversa";

export interface FiltroConversas {
  sistemaId: number;
  status?: StatusConversa;
  busca?: string;
  cursor?: string | null;
  limite: number;
  /** Filtra por `ultima_mensagem_em` — "o que teve atividade nesse intervalo", não "o que foi criado nele". */
  dataInicio: Date;
  dataFim: Date;
}

export interface PaginaConversas {
  itens: Conversa[];
  proximoCursor: string | null;
}

export interface ConversaRepository {
  buscarPorId(id: number): Promise<Conversa | null>;
  /** Relê a linha com `SELECT ... FOR UPDATE`. Só faz sentido dentro de uma transação do UnitOfWork. */
  buscarPorIdParaAtualizacao(id: number): Promise<Conversa | null>;
  listarPorProjeto(filtro: FiltroConversas): Promise<PaginaConversas>;
  contarPorStatus(sistemaId: number, dataInicio: Date, dataFim: Date): Promise<Record<string, number>>;
  salvar(conversa: Conversa): Promise<void>;
}
