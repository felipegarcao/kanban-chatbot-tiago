import { Conversa, type EstadoConversa, type PrioridadeConversa, type StatusConversa } from "@/core/domain/Conversa";

export interface ConversaRow {
  id: number;
  sistema_id: number;
  bot: string | null;
  contato_nome: string | null;
  contato_telefone: string | null;
  status: string;
  estado: string | null;
  prioridade: string | null;
  iniciada_em: Date | null;
  ultima_mensagem_em: Date | null;
  assumida_em: Date | null;
  ultima_mensagem_trecho?: string | null;
}

export function paraDominio(row: ConversaRow): Conversa {
  return Conversa.reconstituir({
    id: row.id,
    sistemaId: row.sistema_id,
    bot: row.bot,
    contatoNome: row.contato_nome,
    contatoTelefone: row.contato_telefone,
    status: row.status as StatusConversa,
    estado: row.estado as EstadoConversa | null,
    prioridade: row.prioridade as PrioridadeConversa | null,
    iniciadaEm: row.iniciada_em,
    ultimaMensagemEm: row.ultima_mensagem_em,
    assumidaEm: row.assumida_em,
    ultimaMensagemTrecho: row.ultima_mensagem_trecho ?? null,
  });
}
