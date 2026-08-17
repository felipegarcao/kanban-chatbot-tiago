import { TransicaoDeStatusInvalida } from "./errors/DomainError";

export type StatusConversa =
  | "ativa"
  | "aguardando_humano"
  | "aguardando_financeiro"
  | "em_atendimento"
  | "aguardando_cliente"
  | "pagamento_aprovado"
  | "aguardando_forms"
  | "encaminhado"
  | "resolvida";

export type EstadoConversa =
  | "abertura"
  | "coletando"
  | "pronto_oferta"
  | "ofertado"
  | "link_enviado"
  | "aguardando_forms"
  | "finalizado";

export type PrioridadeConversa = "normal" | "critica";

/**
 * Estados que o painel escreve. `ativa`, `aguardando_financeiro` e `aguardando_forms` são
 * exclusivos do n8n — `aguardando_forms` é escrito pelo n8n depois do webhook
 * finalizar-atendimento, enquanto espera o cliente preencher e confirmar o formulário.
 * `encaminhado` é escrito pelo painel a partir de `aguardando_forms` (fluxo normal, depois que
 * o cliente confirma o formulário) ou diretamente de `aguardando_humano`/`em_atendimento`
 * (encaminhamento antecipado, sem passar pelo financeiro/formulário) — em qualquer caso é o
 * penúltimo passo do fluxo, logo antes de `resolvida`.
 */
export const STATUS_ESCRITOS_PELO_PAINEL: readonly StatusConversa[] = [
  "em_atendimento",
  "aguardando_cliente",
  "pagamento_aprovado",
  "encaminhado",
  "resolvida",
];

/**
 * Alvos alcançáveis pelo drag-and-drop genérico do kanban (MoverConversaDeStatus).
 * `ativa` fica de fora de propósito: só `devolverParaBot()` pode escrevê-lo — é uma
 * exceção deliberada à regra "painel nunca escreve ativa", tratada como ação explícita
 * fora do mecanismo de arrastar-e-soltar. `aguardando_financeiro` é alvo do painel a
 * partir de `em_atendimento` ou `ativa` — o operador encaminha a conversa pro financeiro
 * manualmente; dali em diante quem confirma é `confirmarPagamento` (ação explícita, não
 * drag). `pagamento_aprovado` só é alcançado via confirmarPagamento — a partir daí quem
 * toca a conversa é o n8n (webhook finalizar-atendimento manda o formulário, grava
 * `aguardando_forms` e, quando o cliente confirmar, grava `resolvida`). `encaminhado` é alvo
 * a partir de `aguardando_humano`, `em_atendimento` ou `aguardando_forms` — o operador
 * encaminha a conversa pra outro setor/fila antes de resolver, seja de forma antecipada
 * (ainda em atendimento) ou depois do formulário confirmado; dali, `resolvida` volta a ser
 * alcançável via drag genérico (delega pra `resolver()`, que agora também aceita
 * `encaminhado` como origem).
 */
const ALVOS_MOVIMENTO_GENERICO: ReadonlySet<StatusConversa> = new Set([
  "em_atendimento",
  "aguardando_cliente",
  "aguardando_financeiro",
  "encaminhado",
  "resolvida",
]);

const TRANSICOES_GENERICAS: Readonly<Record<StatusConversa, ReadonlySet<StatusConversa>>> = {
  ativa: new Set(["aguardando_financeiro"]),
  aguardando_humano: new Set(["em_atendimento", "encaminhado"]),
  aguardando_financeiro: new Set(),
  em_atendimento: new Set(["aguardando_cliente", "aguardando_financeiro", "encaminhado", "resolvida"]),
  aguardando_cliente: new Set(["em_atendimento", "resolvida"]),
  pagamento_aprovado: new Set(),
  aguardando_forms: new Set(["encaminhado"]),
  encaminhado: new Set(["resolvida"]),
  resolvida: new Set(),
};

export interface EventoDominio {
  readonly tipo: string;
  readonly detalhes: Record<string, unknown>;
}

export interface ConversaProps {
  id: number;
  sistemaId: number;
  bot: string | null;
  contatoNome: string | null;
  contatoTelefone: string | null;
  status: StatusConversa;
  estado: EstadoConversa | null;
  prioridade: PrioridadeConversa | null;
  iniciadaEm: Date | null;
  ultimaMensagemEm: Date | null;
  assumidaEm: Date | null;
  finalizadaEm: Date | null;
  /** Trecho de exibição, não é invariante de domínio — carregado só nas listagens do kanban. */
  ultimaMensagemTrecho?: string | null;
}

export class Conversa {
  private eventosPendentes: EventoDominio[] = [];

  private constructor(private props: ConversaProps) {}

  static reconstituir(props: ConversaProps): Conversa {
    return new Conversa({ ...props });
  }

  get id(): number {
    return this.props.id;
  }

  get sistemaId(): number {
    return this.props.sistemaId;
  }

  get status(): StatusConversa {
    return this.props.status;
  }

  get estado(): EstadoConversa | null {
    return this.props.estado;
  }

  get prioridade(): PrioridadeConversa | null {
    return this.props.prioridade;
  }

  get contatoNome(): string | null {
    return this.props.contatoNome;
  }

  get contatoTelefone(): string | null {
    return this.props.contatoTelefone;
  }

  get ultimaMensagemEm(): Date | null {
    return this.props.ultimaMensagemEm;
  }

  get assumidaEm(): Date | null {
    return this.props.assumidaEm;
  }

  get finalizadaEm(): Date | null {
    return this.props.finalizadaEm;
  }

  get ultimaMensagemTrecho(): string | null {
    return this.props.ultimaMensagemTrecho ?? null;
  }

  toProps(): Readonly<ConversaProps> {
    return { ...this.props };
  }

  /** Devolve e limpa os eventos de domínio gerados desde a última extração. */
  extrairEventosPendentes(): EventoDominio[] {
    const eventos = this.eventosPendentes;
    this.eventosPendentes = [];
    return eventos;
  }

  private aplicarTransicao(
    destino: StatusConversa,
    origensPermitidas: readonly StatusConversa[],
    evento: EventoDominio,
  ): void {
    if (!origensPermitidas.includes(this.props.status)) {
      throw new TransicaoDeStatusInvalida(this.props.status, destino);
    }
    this.props.status = destino;
    this.eventosPendentes.push(evento);
  }

  /** aguardando_humano -> em_atendimento */
  assumir(usuarioId: number, agora: Date): void {
    this.aplicarTransicao("em_atendimento", ["aguardando_humano"], {
      tipo: "conversa_assumida",
      detalhes: { usuario_id: usuarioId },
    });
    this.props.assumidaEm = agora;
  }

  /**
   * em_atendimento -> ativa. Única forma do painel escrever `ativa`: uma ação explícita
   * e nomeada, fora do drag-and-drop genérico. Devolve o controle e a fala ao bot.
   */
  devolverParaBot(usuarioId: number): void {
    this.aplicarTransicao("ativa", ["em_atendimento"], {
      tipo: "conversa_devolvida_ao_bot",
      detalhes: { usuario_id: usuarioId },
    });
  }

  /** em_atendimento -> aguardando_cliente */
  aguardarCliente(usuarioId: number): void {
    this.aplicarTransicao("aguardando_cliente", ["em_atendimento"], {
      tipo: "conversa_aguardando_cliente",
      detalhes: { usuario_id: usuarioId },
    });
  }

  /** em_atendimento | aguardando_cliente | encaminhado -> resolvida */
  resolver(usuarioId: number, agora: Date): void {
    this.aplicarTransicao("resolvida", ["em_atendimento", "aguardando_cliente", "encaminhado"], {
      tipo: "conversa_resolvida",
      detalhes: { usuario_id: usuarioId },
    });
    this.props.finalizadaEm = agora;
  }

  /**
   * aguardando_humano | em_atendimento | aguardando_forms -> encaminhado. Passo manual do
   * operador para encaminhar a conversa pra outro setor/fila antes de marcar como resolvida —
   * seja de forma antecipada (ainda aguardando ou em atendimento) ou depois que o cliente
   * confirma o formulário.
   */
  encaminhar(usuarioId: number): void {
    this.aplicarTransicao("encaminhado", ["aguardando_humano", "em_atendimento", "aguardando_forms"], {
      tipo: "conversa_encaminhada",
      detalhes: { usuario_id: usuarioId },
    });
  }

  /** em_atendimento | ativa -> aguardando_financeiro */
  encaminharParaFinanceiro(usuarioId: number): void {
    this.aplicarTransicao("aguardando_financeiro", ["em_atendimento", "ativa"], {
      tipo: "conversa_encaminhada_financeiro",
      detalhes: { usuario_id: usuarioId },
    });
  }

  /**
   * aguardando_financeiro -> pagamento_aprovado. Idempotente por natureza: se o status já
   * não for `aguardando_financeiro` (ex.: dupla confirmação), lança TransicaoDeStatusInvalida
   * em vez de gerar um segundo evento — cabe ao caso de uso tratar isso como "já confirmado".
   *
   * Não vai direto para `resolvida`: a partir daqui o caso de uso aciona o webhook
   * `finalizar-atendimento` do n8n, que manda o formulário ao cliente (status vira
   * `aguardando_forms`, escrito pelo n8n). Quando o cliente confirmar, o operador encaminha
   * manualmente a conversa (`encaminhar()`, aguardando_forms -> encaminhado) e só então marca
   * como `resolvida` — diferente do que essa docstring dizia antes de `encaminhado` existir,
   * o painel volta a escrever `resolvida` nesse fluxo, só que depois desse passo extra.
   */
  confirmarPagamento(usuarioId: number, agora: Date, opts?: { valor?: number; observacao?: string }): void {
    this.aplicarTransicao("pagamento_aprovado", ["aguardando_financeiro"], {
      tipo: "pagamento_confirmado",
      detalhes: {
        usuario_id: usuarioId,
        valor: opts?.valor,
        observacao: opts?.observacao,
        confirmado_em: agora.toISOString(),
      },
    });
  }

  /**
   * Alvo de drag-and-drop genérico do kanban. Não cobre `assumir` (exige registrar quem
   * assumiu) nem `devolverParaBot`/`confirmarPagamento` (ações explícitas, não-drag).
   */
  moverPara(novoStatus: StatusConversa, usuarioId: number, agora: Date): void {
    if (!ALVOS_MOVIMENTO_GENERICO.has(novoStatus)) {
      throw new TransicaoDeStatusInvalida(this.props.status, novoStatus);
    }
    if (this.props.status === "aguardando_humano" && novoStatus === "em_atendimento") {
      this.assumir(usuarioId, agora);
      return;
    }
    if (novoStatus === "aguardando_cliente") {
      this.aguardarCliente(usuarioId);
      return;
    }
    if (novoStatus === "resolvida") {
      this.resolver(usuarioId, agora);
      return;
    }
    if (novoStatus === "aguardando_financeiro") {
      this.encaminharParaFinanceiro(usuarioId);
      return;
    }
    if (novoStatus === "encaminhado") {
      this.encaminhar(usuarioId);
      return;
    }
    if (novoStatus === "em_atendimento" && this.props.status === "aguardando_cliente") {
      this.aplicarTransicao("em_atendimento", ["aguardando_cliente"], {
        tipo: "status_alterado",
        detalhes: { usuario_id: usuarioId, de: "aguardando_cliente", para: "em_atendimento" },
      });
      return;
    }
    throw new TransicaoDeStatusInvalida(this.props.status, novoStatus);
  }

  /** Consulta pura: essa transição seria aceita agora? Usada pelo front para habilitar/desabilitar ações. */
  podeTransicionarPara(novoStatus: StatusConversa): boolean {
    if (novoStatus === "ativa") {
      return this.props.status === "em_atendimento";
    }
    return TRANSICOES_GENERICAS[this.props.status]?.has(novoStatus) ?? false;
  }
}
