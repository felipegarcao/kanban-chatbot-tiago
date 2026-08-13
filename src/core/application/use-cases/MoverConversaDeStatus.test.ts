import { describe, expect, it } from "vitest";
import { MoverConversaDeStatus } from "./MoverConversaDeStatus";
import { ConversaNaoEncontrada, SemPermissaoNoProjeto, TransicaoDeStatusInvalida } from "@/core/domain/errors/DomainError";
import { FakeClock, FakeConversaRepository, FakeEventoRepository, FakeUnitOfWork, conversaDeTeste } from "./testes/fakes";

const AGORA = new Date("2026-01-01T12:00:00Z");

function montar() {
  const conversas = new FakeConversaRepository();
  const eventos = new FakeEventoRepository();
  const unitOfWork = new FakeUnitOfWork(conversas, eventos);
  const clock = new FakeClock(AGORA);
  const useCase = new MoverConversaDeStatus(unitOfWork, clock);
  return { conversas, eventos, useCase };
}

describe("MoverConversaDeStatus", () => {
  it("move aguardando_humano -> em_atendimento e registra assumidaEm", async () => {
    const { conversas, useCase } = montar();
    conversas.semear(conversaDeTeste({ id: 1, status: "aguardando_humano" }));

    const resultado = await useCase.execute({
      conversaId: 1,
      novoStatus: "em_atendimento",
      usuarioId: 42,
      sistemasPermitidos: [1],
    });

    expect(resultado.status).toBe("em_atendimento");
    const conversa = await conversas.buscarPorId(1);
    expect(conversa!.assumidaEm).toEqual(AGORA);
  });

  it("rejeita mover para 'ativa' (só devolverParaBot pode)", async () => {
    const { conversas, useCase } = montar();
    conversas.semear(conversaDeTeste({ id: 1, status: "em_atendimento" }));

    await expect(
      useCase.execute({ conversaId: 1, novoStatus: "ativa", usuarioId: 42, sistemasPermitidos: [1] }),
    ).rejects.toThrow(TransicaoDeStatusInvalida);
  });

  it("rejeita mover aguardando_financeiro -> resolvida (só ConfirmarPagamento pode)", async () => {
    const { conversas, useCase } = montar();
    conversas.semear(conversaDeTeste({ id: 1, status: "aguardando_financeiro" }));

    await expect(
      useCase.execute({ conversaId: 1, novoStatus: "resolvida", usuarioId: 42, sistemasPermitidos: [1] }),
    ).rejects.toThrow(TransicaoDeStatusInvalida);
  });

  it("lança ConversaNaoEncontrada quando o id não existe", async () => {
    const { useCase } = montar();
    await expect(
      useCase.execute({ conversaId: 999, novoStatus: "resolvida", usuarioId: 42, sistemasPermitidos: [1] }),
    ).rejects.toThrow(ConversaNaoEncontrada);
  });

  it("barreira de permissão: 403 quando o operador forja o sistemaId de outro projeto", async () => {
    const { conversas, useCase } = montar();
    conversas.semear(conversaDeTeste({ id: 1, sistemaId: 99, status: "em_atendimento" }));

    await expect(
      useCase.execute({ conversaId: 1, novoStatus: "resolvida", usuarioId: 42, sistemasPermitidos: [1, 2, 3] }),
    ).rejects.toThrow(SemPermissaoNoProjeto);

    const conversa = await conversas.buscarPorId(1);
    expect(conversa!.status).toBe("em_atendimento");
  });
});
