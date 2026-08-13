import { describe, expect, it } from "vitest";
import { ConfirmarPagamento } from "./ConfirmarPagamento";
import { ConversaNaoEncontrada, SemPermissaoNoProjeto, TransicaoDeStatusInvalida } from "@/core/domain/errors/DomainError";
import {
  FakeClock,
  FakeConversaRepository,
  FakeEventoRepository,
  FakeUnitOfWork,
  FakeWebhookFinalizarAtendimento,
  conversaDeTeste,
} from "./testes/fakes";

const AGORA = new Date("2026-01-01T12:00:00Z");

function montar() {
  const conversas = new FakeConversaRepository();
  const eventos = new FakeEventoRepository();
  const unitOfWork = new FakeUnitOfWork(conversas, eventos);
  const clock = new FakeClock(AGORA);
  const webhook = new FakeWebhookFinalizarAtendimento();
  const useCase = new ConfirmarPagamento(unitOfWork, clock, webhook, eventos);
  return { conversas, eventos, webhook, useCase };
}

/** O webhook é disparado sem bloquear o retorno do caso de uso — espera a microtask assentar. */
function aguardarTarefasPendentes(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("ConfirmarPagamento", () => {
  it("move aguardando_financeiro -> pagamento_aprovado e grava evento pagamento_confirmado", async () => {
    const { conversas, eventos, useCase } = montar();
    conversas.semear(conversaDeTeste({ id: 1, status: "aguardando_financeiro", estado: "finalizado" }));

    await useCase.execute({ conversaId: 1, usuarioId: 42, sistemasPermitidos: [1], valor: 150, observacao: "pix" });

    const conversa = await conversas.buscarPorId(1);
    expect(conversa!.status).toBe("pagamento_aprovado");
    expect(eventos.registrados).toHaveLength(1);
    expect(eventos.registrados[0]).toMatchObject({
      conversaId: 1,
      evento: { tipo: "pagamento_confirmado", detalhes: { usuario_id: 42, valor: 150, observacao: "pix" } },
    });
  });

  it("dispara o webhook finalizar-atendimento com os dados da conversa, sem bloquear o retorno", async () => {
    const { conversas, webhook, useCase } = montar();
    conversas.semear(
      conversaDeTeste({
        id: 1,
        sistemaId: 3,
        contatoNome: "Fulano",
        contatoTelefone: "5518999999999@s.whatsapp.net",
        status: "aguardando_financeiro",
      }),
    );

    await useCase.execute({ conversaId: 1, usuarioId: 42, sistemasPermitidos: [3], valor: 150, observacao: "pix" });
    await aguardarTarefasPendentes();

    expect(webhook.chamadas).toEqual([
      {
        conversaId: 1,
        sistemaId: 3,
        contatoNome: "Fulano",
        contatoTelefone: "5518999999999@s.whatsapp.net",
        usuarioId: 42,
        valor: 150,
        observacao: "pix",
        confirmadoEm: AGORA.toISOString(),
      },
    ]);
  });

  it("se o webhook falhar, registra um evento de falha mas não desfaz a confirmação", async () => {
    const { conversas, eventos, webhook, useCase } = montar();
    conversas.semear(conversaDeTeste({ id: 1, status: "aguardando_financeiro" }));
    webhook.falharCom = new Error("timeout");

    await useCase.execute({ conversaId: 1, usuarioId: 42, sistemasPermitidos: [1] });
    await aguardarTarefasPendentes();

    const conversa = await conversas.buscarPorId(1);
    expect(conversa!.status).toBe("pagamento_aprovado");
    expect(eventos.registrados.map((r) => r.evento.tipo)).toEqual([
      "pagamento_confirmado",
      "webhook_finalizar_atendimento_falhou",
    ]);
  });

  it("dupla confirmação: a segunda chamada falha e não gera um segundo evento (idempotência)", async () => {
    const { conversas, eventos, useCase } = montar();
    conversas.semear(conversaDeTeste({ id: 1, status: "aguardando_financeiro" }));

    await useCase.execute({ conversaId: 1, usuarioId: 42, sistemasPermitidos: [1] });
    await expect(useCase.execute({ conversaId: 1, usuarioId: 42, sistemasPermitidos: [1] })).rejects.toThrow(
      TransicaoDeStatusInvalida,
    );

    expect(eventos.registrados).toHaveLength(1);
    const conversa = await conversas.buscarPorId(1);
    expect(conversa!.status).toBe("pagamento_aprovado");
  });

  it("rejeita quando a conversa não está em aguardando_financeiro", async () => {
    const { conversas, useCase } = montar();
    conversas.semear(conversaDeTeste({ id: 1, status: "em_atendimento" }));

    await expect(useCase.execute({ conversaId: 1, usuarioId: 42, sistemasPermitidos: [1] })).rejects.toThrow(
      TransicaoDeStatusInvalida,
    );
  });

  it("lança ConversaNaoEncontrada quando o id não existe", async () => {
    const { useCase } = montar();
    await expect(useCase.execute({ conversaId: 999, usuarioId: 42, sistemasPermitidos: [1] })).rejects.toThrow(
      ConversaNaoEncontrada,
    );
  });

  it("barreira de permissão: rejeita quando o sistemaId da conversa não está em sistemasPermitidos", async () => {
    const { conversas, useCase } = montar();
    conversas.semear(conversaDeTeste({ id: 1, sistemaId: 7, status: "aguardando_financeiro" }));

    await expect(useCase.execute({ conversaId: 1, usuarioId: 42, sistemasPermitidos: [1, 2] })).rejects.toThrow(
      SemPermissaoNoProjeto,
    );

    const conversa = await conversas.buscarPorId(1);
    expect(conversa!.status).toBe("aguardando_financeiro");
  });
});
