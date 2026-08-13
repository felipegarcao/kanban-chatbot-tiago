import type { ConversaRepository } from "./ConversaRepository";
import type { EventoRepository } from "./EventoRepository";

/** Repositórios vinculados ao client de uma transação aberta — todo uso dentro dela fica atômico. */
export interface TransacaoContexto {
  conversas: ConversaRepository;
  eventos: EventoRepository;
}

export interface UnitOfWork {
  executar<T>(fn: (ctx: TransacaoContexto) => Promise<T>): Promise<T>;
}
