import { ConversaNaoEncontrada } from "@/core/domain/errors/DomainError";
import { garantirAcessoAoProjeto } from "@/core/domain/permissoes";
import type { Clock } from "@/core/application/ports/Clock";
import type { UnitOfWork } from "@/core/application/ports/UnitOfWork";
import type { StatusConversa } from "@/core/domain/Conversa";

export interface MoverConversaDeStatusInput {
  conversaId: number;
  novoStatus: StatusConversa;
  usuarioId: number;
  sistemasPermitidos: number[];
}

export interface MoverConversaDeStatusOutput {
  status: StatusConversa;
}

/**
 * Drag-and-drop genérico do kanban. Relê a linha com FOR UPDATE dentro da transação porque
 * o n8n pode alterar a mesma conversa entre a leitura da UI e este clique — se o status já
 * não bater com o que a entidade espera, a transição de domínio falha e devolvemos conflito
 * em vez de sobrescrever o que o bot acabou de gravar.
 */
export class MoverConversaDeStatus {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly clock: Clock,
  ) {}

  async execute(input: MoverConversaDeStatusInput): Promise<MoverConversaDeStatusOutput> {
    return this.unitOfWork.executar(async (ctx) => {
      const conversa = await ctx.conversas.buscarPorIdParaAtualizacao(input.conversaId);
      if (!conversa) {
        throw new ConversaNaoEncontrada(input.conversaId);
      }
      garantirAcessoAoProjeto(conversa.sistemaId, input.sistemasPermitidos);

      conversa.moverPara(input.novoStatus, input.usuarioId, this.clock.agora());

      await ctx.conversas.salvar(conversa);
      for (const evento of conversa.extrairEventosPendentes()) {
        await ctx.eventos.registrar(conversa.id, evento);
      }

      return { status: conversa.status };
    });
  }
}
