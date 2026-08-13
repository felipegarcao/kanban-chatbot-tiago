import { ConversaNaoEncontrada } from "@/core/domain/errors/DomainError";
import { garantirAcessoAoProjeto } from "@/core/domain/permissoes";
import type { ConversaRepository } from "@/core/application/ports/ConversaRepository";
import type { Evento } from "@/core/application/ports/EventoRepository";
import type { EventoRepository } from "@/core/application/ports/EventoRepository";
import type { Mensagem } from "@/core/application/ports/MensagemRepository";
import type { MensagemRepository } from "@/core/application/ports/MensagemRepository";
import type { Conversa } from "@/core/domain/Conversa";

export interface ObterDetalheDaConversaInput {
  conversaId: number;
  sistemasPermitidos: number[];
}

export interface DetalheDaConversa {
  conversa: Conversa;
  mensagens: Mensagem[];
  eventos: Evento[];
}

const LIMITE_MENSAGENS = 50;

export class ObterDetalheDaConversa {
  constructor(
    private readonly conversas: ConversaRepository,
    private readonly mensagens: MensagemRepository,
    private readonly eventos: EventoRepository,
  ) {}

  async execute(input: ObterDetalheDaConversaInput): Promise<DetalheDaConversa> {
    const conversa = await this.conversas.buscarPorId(input.conversaId);
    if (!conversa) {
      throw new ConversaNaoEncontrada(input.conversaId);
    }
    garantirAcessoAoProjeto(conversa.sistemaId, input.sistemasPermitidos);

    const [mensagens, eventos] = await Promise.all([
      this.mensagens.listarUltimasPorConversa(conversa.id, LIMITE_MENSAGENS),
      this.eventos.listarPorConversa(conversa.id),
    ]);

    return { conversa, mensagens, eventos };
  }
}
