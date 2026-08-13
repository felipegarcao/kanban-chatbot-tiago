import { ConversaNaoEncontrada } from "@/core/domain/errors/DomainError";
import { garantirAcessoAoProjeto } from "@/core/domain/permissoes";
import type { Clock } from "@/core/application/ports/Clock";
import type { UnitOfWork } from "@/core/application/ports/UnitOfWork";

export interface ConfirmarPagamentoInput {
  conversaId: number;
  usuarioId: number;
  sistemasPermitidos: number[];
  valor?: number;
  observacao?: string;
}

/**
 * Fluxo financeiro: aguardando_financeiro -> resolvida, numa única transação com
 * SELECT ... FOR UPDATE. Idempotente por natureza — chamar duas vezes na segunda vez
 * relê status já 'resolvida' e a entidade rejeita a transição em vez de duplicar o evento.
 */
export class ConfirmarPagamento {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly clock: Clock,
  ) {}

  async execute(input: ConfirmarPagamentoInput): Promise<void> {
    await this.unitOfWork.executar(async (ctx) => {
      const conversa = await ctx.conversas.buscarPorIdParaAtualizacao(input.conversaId);
      if (!conversa) {
        throw new ConversaNaoEncontrada(input.conversaId);
      }
      garantirAcessoAoProjeto(conversa.sistemaId, input.sistemasPermitidos);

      conversa.confirmarPagamento(input.usuarioId, this.clock.agora(), {
        valor: input.valor,
        observacao: input.observacao,
      });

      await ctx.conversas.salvar(conversa);
      for (const evento of conversa.extrairEventosPendentes()) {
        await ctx.eventos.registrar(conversa.id, evento);
      }
    });
  }
}
