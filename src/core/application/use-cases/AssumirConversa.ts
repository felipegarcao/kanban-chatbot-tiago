import { ConversaNaoEncontrada } from "@/core/domain/errors/DomainError";
import { garantirAcessoAoProjeto } from "@/core/domain/permissoes";
import type { Clock } from "@/core/application/ports/Clock";
import type { UnitOfWork } from "@/core/application/ports/UnitOfWork";

export interface AssumirConversaInput {
  conversaId: number;
  usuarioId: number;
  sistemasPermitidos: number[];
}

export class AssumirConversa {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly clock: Clock,
  ) {}

  async execute(input: AssumirConversaInput): Promise<void> {
    await this.unitOfWork.executar(async (ctx) => {
      const conversa = await ctx.conversas.buscarPorIdParaAtualizacao(input.conversaId);
      if (!conversa) {
        throw new ConversaNaoEncontrada(input.conversaId);
      }
      garantirAcessoAoProjeto(conversa.sistemaId, input.sistemasPermitidos);

      conversa.assumir(input.usuarioId, this.clock.agora());

      await ctx.conversas.salvar(conversa);
      for (const evento of conversa.extrairEventosPendentes()) {
        await ctx.eventos.registrar(conversa.id, evento);
      }
    });
  }
}
