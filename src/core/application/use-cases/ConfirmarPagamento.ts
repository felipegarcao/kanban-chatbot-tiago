import { ConversaNaoEncontrada } from "@/core/domain/errors/DomainError";
import { garantirAcessoAoProjeto } from "@/core/domain/permissoes";
import type { Clock } from "@/core/application/ports/Clock";
import type { EventoRepository } from "@/core/application/ports/EventoRepository";
import type { UnitOfWork } from "@/core/application/ports/UnitOfWork";
import type { WebhookFinalizarAtendimento } from "@/core/application/ports/WebhookFinalizarAtendimento";

export interface ConfirmarPagamentoInput {
  conversaId: number;
  usuarioId: number;
  sistemasPermitidos: number[];
  valor?: number;
  observacao?: string;
}

/**
 * Fluxo financeiro: aguardando_financeiro -> pagamento_realizado, numa única transação com
 * SELECT ... FOR UPDATE. Idempotente por natureza — chamar duas vezes na segunda vez relê o
 * status já alterado e a entidade rejeita a transição em vez de duplicar o evento.
 *
 * Depois que a transação confirma, dispara o webhook finalizar-atendimento do n8n sem
 * bloquear quem chamou — a confirmação local já aconteceu, que é o que importa pro operador
 * nesse instante. O n8n manda o formulário ao cliente e, quando ele confirmar, finaliza a
 * conversa (grava status = 'resolvida' direto no banco); o painel não espera nem controla
 * essa parte. Se o webhook falhar ao ser disparado, fica registrado como evento — não desfaz
 * a confirmação, só documenta que alguém vai precisar acionar o n8n manualmente.
 */
export class ConfirmarPagamento {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly clock: Clock,
    private readonly webhook: WebhookFinalizarAtendimento,
    private readonly eventos: EventoRepository,
  ) {}

  async execute(input: ConfirmarPagamentoInput): Promise<void> {
    const agora = this.clock.agora();

    const conversa = await this.unitOfWork.executar(async (ctx) => {
      const conversa = await ctx.conversas.buscarPorIdParaAtualizacao(input.conversaId);
      if (!conversa) {
        throw new ConversaNaoEncontrada(input.conversaId);
      }
      garantirAcessoAoProjeto(conversa.sistemaId, input.sistemasPermitidos);

      conversa.confirmarPagamento(input.usuarioId, agora, {
        valor: input.valor,
        observacao: input.observacao,
      });

      await ctx.conversas.salvar(conversa);
      for (const evento of conversa.extrairEventosPendentes()) {
        await ctx.eventos.registrar(conversa.id, evento);
      }

      return conversa;
    });

    void this.webhook
      .notificar({
        conversaId: conversa.id,
        sistemaId: conversa.sistemaId,
        contatoNome: conversa.contatoNome,
        contatoTelefone: conversa.contatoTelefone,
        usuarioId: input.usuarioId,
        valor: input.valor,
        observacao: input.observacao,
        confirmadoEm: agora.toISOString(),
      })
      .catch((erro: unknown) =>
        this.eventos
          .registrar(conversa.id, {
            tipo: "webhook_finalizar_atendimento_falhou",
            detalhes: { erro: erro instanceof Error ? erro.message : String(erro) },
          })
          .catch(() => {
            // melhor esforço: se nem o registro do erro funcionar, não há mais o que fazer aqui.
          }),
      );
  }
}
