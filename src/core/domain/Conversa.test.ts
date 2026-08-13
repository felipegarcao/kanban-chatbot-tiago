import { describe, expect, it } from "vitest";
import { Conversa, type ConversaProps, type StatusConversa } from "./Conversa";
import { TransicaoDeStatusInvalida } from "./errors/DomainError";

function criarConversa(status: StatusConversa, overrides: Partial<ConversaProps> = {}): Conversa {
  const props: ConversaProps = {
    id: 1,
    sistemaId: 1,
    bot: "tiago",
    contatoNome: "Fulano",
    contatoTelefone: "5518999999999@s.whatsapp.net",
    status,
    estado: "coletando",
    prioridade: "normal",
    iniciadaEm: new Date("2026-01-01T10:00:00Z"),
    ultimaMensagemEm: new Date("2026-01-01T10:05:00Z"),
    assumidaEm: null,
    ...overrides,
  };
  return Conversa.reconstituir(props);
}

const AGORA = new Date("2026-01-01T12:00:00Z");
const USUARIO_ID = 42;

describe("Conversa - assumir", () => {
  it("move aguardando_humano -> em_atendimento e registra assumidaEm", () => {
    const conversa = criarConversa("aguardando_humano");
    conversa.assumir(USUARIO_ID, AGORA);
    expect(conversa.status).toBe("em_atendimento");
    expect(conversa.assumidaEm).toBe(AGORA);
    expect(conversa.extrairEventosPendentes()).toEqual([
      { tipo: "conversa_assumida", detalhes: { usuario_id: USUARIO_ID } },
    ]);
  });

  it.each<StatusConversa>(["ativa", "aguardando_financeiro", "em_atendimento", "aguardando_cliente", "resolvida"])(
    "rejeita assumir a partir de %s",
    (status) => {
      const conversa = criarConversa(status);
      expect(() => conversa.assumir(USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
    },
  );
});

describe("Conversa - devolverParaBot", () => {
  it("move em_atendimento -> ativa", () => {
    const conversa = criarConversa("em_atendimento");
    conversa.devolverParaBot(USUARIO_ID);
    expect(conversa.status).toBe("ativa");
    expect(conversa.extrairEventosPendentes()).toEqual([
      { tipo: "conversa_devolvida_ao_bot", detalhes: { usuario_id: USUARIO_ID } },
    ]);
  });

  it.each<StatusConversa>(["ativa", "aguardando_humano", "aguardando_financeiro", "aguardando_cliente", "resolvida"])(
    "rejeita devolverParaBot a partir de %s",
    (status) => {
      const conversa = criarConversa(status);
      expect(() => conversa.devolverParaBot(USUARIO_ID)).toThrow(TransicaoDeStatusInvalida);
    },
  );
});

describe("Conversa - aguardarCliente", () => {
  it("move em_atendimento -> aguardando_cliente", () => {
    const conversa = criarConversa("em_atendimento");
    conversa.aguardarCliente(USUARIO_ID);
    expect(conversa.status).toBe("aguardando_cliente");
  });

  it.each<StatusConversa>(["ativa", "aguardando_humano", "aguardando_financeiro", "aguardando_cliente", "resolvida"])(
    "rejeita aguardarCliente a partir de %s",
    (status) => {
      const conversa = criarConversa(status);
      expect(() => conversa.aguardarCliente(USUARIO_ID)).toThrow(TransicaoDeStatusInvalida);
    },
  );
});

describe("Conversa - resolver", () => {
  it.each<StatusConversa>(["em_atendimento", "aguardando_cliente"])("move %s -> resolvida", (status) => {
    const conversa = criarConversa(status);
    conversa.resolver(USUARIO_ID);
    expect(conversa.status).toBe("resolvida");
  });

  it.each<StatusConversa>(["ativa", "aguardando_humano", "aguardando_financeiro", "resolvida"])(
    "rejeita resolver a partir de %s",
    (status) => {
      const conversa = criarConversa(status);
      expect(() => conversa.resolver(USUARIO_ID)).toThrow(TransicaoDeStatusInvalida);
    },
  );
});

describe("Conversa - confirmarPagamento", () => {
  it("move aguardando_financeiro -> resolvida e registra evento pagamento_confirmado", () => {
    const conversa = criarConversa("aguardando_financeiro", { estado: "finalizado" });
    conversa.confirmarPagamento(USUARIO_ID, AGORA, { valor: 150.5, observacao: "pix" });
    expect(conversa.status).toBe("resolvida");
    expect(conversa.extrairEventosPendentes()).toEqual([
      {
        tipo: "pagamento_confirmado",
        detalhes: { usuario_id: USUARIO_ID, valor: 150.5, observacao: "pix", confirmado_em: AGORA.toISOString() },
      },
    ]);
  });

  it("é idempotente: confirmar duas vezes na segunda vez lança erro em vez de gerar outro evento", () => {
    const conversa = criarConversa("aguardando_financeiro");
    conversa.confirmarPagamento(USUARIO_ID, AGORA);
    expect(() => conversa.confirmarPagamento(USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
  });

  it.each<StatusConversa>(["ativa", "aguardando_humano", "em_atendimento", "aguardando_cliente", "resolvida"])(
    "rejeita confirmarPagamento a partir de %s",
    (status) => {
      const conversa = criarConversa(status);
      expect(() => conversa.confirmarPagamento(USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
    },
  );
});

describe("Conversa - moverPara (drag-and-drop genérico)", () => {
  it("aguardando_humano -> em_atendimento delega para assumir (registra assumidaEm)", () => {
    const conversa = criarConversa("aguardando_humano");
    conversa.moverPara("em_atendimento", USUARIO_ID, AGORA);
    expect(conversa.status).toBe("em_atendimento");
    expect(conversa.assumidaEm).toBe(AGORA);
  });

  it("aguardando_cliente -> em_atendimento é permitido via drag", () => {
    const conversa = criarConversa("aguardando_cliente");
    conversa.moverPara("em_atendimento", USUARIO_ID, AGORA);
    expect(conversa.status).toBe("em_atendimento");
  });

  it("em_atendimento -> aguardando_cliente é permitido via drag", () => {
    const conversa = criarConversa("em_atendimento");
    conversa.moverPara("aguardando_cliente", USUARIO_ID, AGORA);
    expect(conversa.status).toBe("aguardando_cliente");
  });

  it.each<StatusConversa>(["em_atendimento", "aguardando_cliente"])("%s -> resolvida é permitido via drag", (status) => {
    const conversa = criarConversa(status);
    conversa.moverPara("resolvida", USUARIO_ID, AGORA);
    expect(conversa.status).toBe("resolvida");
  });

  it("nunca aceita 'ativa' como alvo do drag genérico (só devolverParaBot pode)", () => {
    const conversa = criarConversa("em_atendimento");
    expect(() => conversa.moverPara("ativa", USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
  });

  it("nunca aceita 'aguardando_financeiro' como alvo do drag genérico", () => {
    const conversa = criarConversa("em_atendimento");
    expect(() => conversa.moverPara("aguardando_financeiro", USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
  });

  it("aguardando_financeiro -> resolvida NÃO é permitido via drag genérico (só ConfirmarPagamento)", () => {
    const conversa = criarConversa("aguardando_financeiro");
    expect(() => conversa.moverPara("resolvida", USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
  });

  it("rejeita mover a partir de 'resolvida' (estado terminal)", () => {
    const conversa = criarConversa("resolvida");
    expect(() => conversa.moverPara("em_atendimento", USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
  });

  it("rejeita mover a partir de 'ativa' (bot-owned, painel não pode tirar de lá)", () => {
    const conversa = criarConversa("ativa");
    expect(() => conversa.moverPara("em_atendimento", USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
  });
});

describe("Conversa - podeTransicionarPara (consulta pura para o front)", () => {
  it("reporta true apenas para transições válidas a partir de aguardando_humano", () => {
    const conversa = criarConversa("aguardando_humano");
    expect(conversa.podeTransicionarPara("em_atendimento")).toBe(true);
    expect(conversa.podeTransicionarPara("resolvida")).toBe(false);
    expect(conversa.podeTransicionarPara("ativa")).toBe(false);
  });

  it("reporta true para devolverParaBot apenas a partir de em_atendimento", () => {
    expect(criarConversa("em_atendimento").podeTransicionarPara("ativa")).toBe(true);
    expect(criarConversa("aguardando_cliente").podeTransicionarPara("ativa")).toBe(false);
  });

  it("não altera estado (é side-effect free)", () => {
    const conversa = criarConversa("em_atendimento");
    conversa.podeTransicionarPara("resolvida");
    expect(conversa.status).toBe("em_atendimento");
    expect(conversa.extrairEventosPendentes()).toEqual([]);
  });
});
