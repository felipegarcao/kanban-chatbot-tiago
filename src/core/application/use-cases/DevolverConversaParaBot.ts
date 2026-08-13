import { ConversaNaoEncontrada } from "@/core/domain/errors/DomainError";
import { garantirAcessoAoProjeto } from "@/core/domain/permissoes";
import type { UnitOfWork } from "@/core/application/ports/UnitOfWork";

export interface DevolverConversaParaBotInput {
  conversaId: number;
  usuarioId: number;
  sistemasPermitidos: number[];
}

/** Único caminho do painel para escrever `status = 'ativa'` — devolve a fala ao bot no WhatsApp. */
export class DevolverConversaParaBot {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async execute(input: DevolverConversaParaBotInput): Promise<void> {
    await this.unitOfWork.executar(async (ctx) => {
      const conversa = await ctx.conversas.buscarPorIdParaAtualizacao(input.conversaId);
      if (!conversa) {
        throw new ConversaNaoEncontrada(input.conversaId);
      }
      garantirAcessoAoProjeto(conversa.sistemaId, input.sistemasPermitidos);

      conversa.devolverParaBot(input.usuarioId);

      await ctx.conversas.salvar(conversa);
      for (const evento of conversa.extrairEventosPendentes()) {
        await ctx.eventos.registrar(conversa.id, evento);
      }
    });
  }
}
