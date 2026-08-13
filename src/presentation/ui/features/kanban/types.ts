import type { EstadoConversa, PrioridadeConversa, StatusConversa } from "@/core/domain/Conversa";

export interface ConversaResumo {
  id: number;
  sistemaId: number;
  bot: string | null;
  contatoNome: string | null;
  contatoTelefone: string | null;
  status: StatusConversa;
  estado: EstadoConversa | null;
  prioridade: PrioridadeConversa | null;
  iniciadaEm: string | null;
  ultimaMensagemEm: string | null;
  assumidaEm: string | null;
  ultimaMensagemTrecho: string | null;
}

export interface PaginaConversasResumo {
  itens: ConversaResumo[];
  proximoCursor: string | null;
}

export interface ColunaResumo {
  id: number;
  sistemaId: number;
  chave: StatusConversa;
  titulo: string;
  cor: string;
  ordem: number;
  visivel: boolean;
}

export interface MensagemResumo {
  id: number;
  conversaId: number;
  autor: "contato" | "bot" | "humano";
  conteudo: string | null;
  criadoEm: string;
}

export interface EventoResumo {
  id: number;
  conversaId: number;
  tipo: string;
  detalhes: Record<string, unknown>;
  criadoEm: string;
}

export interface DetalheConversa {
  conversa: ConversaResumo;
  mensagens: MensagemResumo[];
  eventos: EventoResumo[];
}
