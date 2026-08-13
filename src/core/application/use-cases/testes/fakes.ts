import { Conversa, type ConversaProps } from "@/core/domain/Conversa";
import type { Clock } from "@/core/application/ports/Clock";
import type { ConversaRepository, FiltroConversas, PaginaConversas } from "@/core/application/ports/ConversaRepository";
import type { Evento, EventoRepository } from "@/core/application/ports/EventoRepository";
import type { TransacaoContexto, UnitOfWork } from "@/core/application/ports/UnitOfWork";
import type {
  PayloadFinalizarAtendimento,
  WebhookFinalizarAtendimento,
} from "@/core/application/ports/WebhookFinalizarAtendimento";
import type { EventoDominio } from "@/core/domain/Conversa";

export class FakeConversaRepository implements ConversaRepository {
  private linhas = new Map<number, ConversaProps>();

  semear(props: ConversaProps): void {
    this.linhas.set(props.id, props);
  }

  async buscarPorId(id: number): Promise<Conversa | null> {
    const props = this.linhas.get(id);
    return props ? Conversa.reconstituir(props) : null;
  }

  async buscarPorIdParaAtualizacao(id: number): Promise<Conversa | null> {
    return this.buscarPorId(id);
  }

  async listarPorProjeto(_filtro: FiltroConversas): Promise<PaginaConversas> {
    throw new Error("não usado nestes testes");
  }

  async contarPorStatus(_sistemaId: number, _dataInicio: Date, _dataFim: Date): Promise<Record<string, number>> {
    throw new Error("não usado nestes testes");
  }

  async salvar(conversa: Conversa): Promise<void> {
    this.linhas.set(conversa.id, conversa.toProps());
  }
}

export class FakeEventoRepository implements EventoRepository {
  readonly registrados: Array<{ conversaId: number; evento: EventoDominio }> = [];

  async listarPorConversa(_conversaId: number): Promise<Evento[]> {
    throw new Error("não usado nestes testes");
  }

  async registrar(conversaId: number, evento: EventoDominio): Promise<void> {
    this.registrados.push({ conversaId, evento });
  }
}

/** Sem atomicidade real (não precisa pra teste de caso de uso) — só amarra os fakes num contexto. */
export class FakeUnitOfWork implements UnitOfWork {
  constructor(
    private readonly conversas: ConversaRepository,
    private readonly eventos: EventoRepository,
  ) {}

  async executar<T>(fn: (ctx: TransacaoContexto) => Promise<T>): Promise<T> {
    return fn({ conversas: this.conversas, eventos: this.eventos });
  }
}

export class FakeClock implements Clock {
  constructor(private readonly fixa: Date) {}

  agora(): Date {
    return this.fixa;
  }
}

export class FakeWebhookFinalizarAtendimento implements WebhookFinalizarAtendimento {
  readonly chamadas: PayloadFinalizarAtendimento[] = [];
  falharCom: Error | null = null;

  async notificar(payload: PayloadFinalizarAtendimento): Promise<void> {
    this.chamadas.push(payload);
    if (this.falharCom) throw this.falharCom;
  }
}

export function conversaDeTeste(overrides: Partial<ConversaProps> = {}): ConversaProps {
  return {
    id: 1,
    sistemaId: 1,
    bot: "tiago",
    contatoNome: "Fulano",
    contatoTelefone: "5518999999999@s.whatsapp.net",
    status: "aguardando_humano",
    estado: "coletando",
    prioridade: "normal",
    iniciadaEm: new Date("2026-01-01T10:00:00Z"),
    ultimaMensagemEm: new Date("2026-01-01T10:05:00Z"),
    assumidaEm: null,
    ...overrides,
  };
}
