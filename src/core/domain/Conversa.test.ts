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
    finalizadaEm: null,
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

  it.each<StatusConversa>([
    "ativa",
    "aguardando_financeiro",
    "em_atendimento",
    "aguardando_cliente",
    "pagamento_aprovado",
    "aguardando_forms",
    "encaminhado",
    "resolvida",
  ])("rejeita assumir a partir de %s", (status) => {
    const conversa = criarConversa(status);
    expect(() => conversa.assumir(USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
  });
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

  it.each<StatusConversa>([
    "ativa",
    "aguardando_humano",
    "aguardando_financeiro",
    "aguardando_cliente",
    "pagamento_aprovado",
    "aguardando_forms",
    "encaminhado",
    "resolvida",
  ])("rejeita devolverParaBot a partir de %s", (status) => {
    const conversa = criarConversa(status);
    expect(() => conversa.devolverParaBot(USUARIO_ID)).toThrow(TransicaoDeStatusInvalida);
  });
});

describe("Conversa - aguardarCliente", () => {
  it("move em_atendimento -> aguardando_cliente", () => {
    const conversa = criarConversa("em_atendimento");
    conversa.aguardarCliente(USUARIO_ID);
    expect(conversa.status).toBe("aguardando_cliente");
  });

  it.each<StatusConversa>([
    "ativa",
    "aguardando_humano",
    "aguardando_financeiro",
    "aguardando_cliente",
    "pagamento_aprovado",
    "aguardando_forms",
    "encaminhado",
    "resolvida",
  ])("rejeita aguardarCliente a partir de %s", (status) => {
    const conversa = criarConversa(status);
    expect(() => conversa.aguardarCliente(USUARIO_ID)).toThrow(TransicaoDeStatusInvalida);
  });
});

describe("Conversa - resolver", () => {
  it.each<StatusConversa>(["em_atendimento", "aguardando_cliente", "encaminhado"])(
    "move %s -> resolvida e registra finalizadaEm",
    (status) => {
      const conversa = criarConversa(status);
      conversa.resolver(USUARIO_ID, AGORA);
      expect(conversa.status).toBe("resolvida");
      expect(conversa.finalizadaEm).toBe(AGORA);
    },
  );

  it.each<StatusConversa>([
    "ativa",
    "aguardando_humano",
    "aguardando_financeiro",
    "pagamento_aprovado",
    "aguardando_forms",
    "resolvida",
  ])("rejeita resolver a partir de %s", (status) => {
    const conversa = criarConversa(status);
    expect(() => conversa.resolver(USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
  });
});

describe("Conversa - encaminharParaFinanceiro", () => {
  it.each<StatusConversa>(["em_atendimento", "ativa"])("move %s -> aguardando_financeiro", (status) => {
    const conversa = criarConversa(status);
    conversa.encaminharParaFinanceiro(USUARIO_ID);
    expect(conversa.status).toBe("aguardando_financeiro");
    expect(conversa.extrairEventosPendentes()).toEqual([
      { tipo: "conversa_encaminhada_financeiro", detalhes: { usuario_id: USUARIO_ID } },
    ]);
  });

  it.each<StatusConversa>([
    "aguardando_humano",
    "aguardando_financeiro",
    "aguardando_cliente",
    "pagamento_aprovado",
    "aguardando_forms",
    "encaminhado",
    "resolvida",
  ])("rejeita encaminharParaFinanceiro a partir de %s", (status) => {
    const conversa = criarConversa(status);
    expect(() => conversa.encaminharParaFinanceiro(USUARIO_ID)).toThrow(TransicaoDeStatusInvalida);
  });
});

describe("Conversa - encaminhar", () => {
  it.each<StatusConversa>(["aguardando_humano", "em_atendimento", "aguardando_forms"])(
    "move %s -> encaminhado",
    (status) => {
      const conversa = criarConversa(status);
      conversa.encaminhar(USUARIO_ID);
      expect(conversa.status).toBe("encaminhado");
      expect(conversa.extrairEventosPendentes()).toEqual([
        { tipo: "conversa_encaminhada", detalhes: { usuario_id: USUARIO_ID } },
      ]);
    },
  );

  it.each<StatusConversa>([
    "ativa",
    "aguardando_financeiro",
    "aguardando_cliente",
    "pagamento_aprovado",
    "encaminhado",
    "resolvida",
  ])("rejeita encaminhar a partir de %s", (status) => {
    const conversa = criarConversa(status);
    expect(() => conversa.encaminhar(USUARIO_ID)).toThrow(TransicaoDeStatusInvalida);
  });
});

describe("Conversa - confirmarPagamento", () => {
  it("move aguardando_financeiro -> pagamento_aprovado e registra evento pagamento_confirmado", () => {
    const conversa = criarConversa("aguardando_financeiro", { estado: "finalizado" });
    conversa.confirmarPagamento(USUARIO_ID, AGORA, { valor: 150.5, observacao: "pix" });
    expect(conversa.status).toBe("pagamento_aprovado");
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

  it.each<StatusConversa>([
    "ativa",
    "aguardando_humano",
    "em_atendimento",
    "aguardando_cliente",
    "pagamento_aprovado",
    "aguardando_forms",
    "encaminhado",
    "resolvida",
  ])("rejeita confirmarPagamento a partir de %s", (status) => {
    const conversa = criarConversa(status);
    expect(() => conversa.confirmarPagamento(USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
  });
});

describe("Conversa - pagamento_aprovado e aguardando_forms são terminais do lado do painel", () => {
  it("rejeita mover a partir de pagamento_aprovado via drag genérico (só o n8n resolve, via webhook)", () => {
    const conversa = criarConversa("pagamento_aprovado");
    expect(() => conversa.moverPara("resolvida", USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
  });

  it("nunca aceita 'pagamento_aprovado' como alvo do drag genérico (só ConfirmarPagamento)", () => {
    const conversa = criarConversa("aguardando_financeiro");
    expect(() => conversa.moverPara("pagamento_aprovado", USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
  });

  it("rejeita mover de aguardando_forms direto pra resolvida (só via encaminhado)", () => {
    const conversa = criarConversa("aguardando_forms");
    expect(() => conversa.moverPara("resolvida", USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
  });

  it("nunca aceita 'aguardando_forms' como alvo do drag genérico", () => {
    const conversa = criarConversa("pagamento_aprovado");
    expect(() => conversa.moverPara("aguardando_forms", USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
  });
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

  it.each<StatusConversa>(["em_atendimento", "aguardando_cliente", "encaminhado"])(
    "%s -> resolvida é permitido via drag e registra finalizadaEm",
    (status) => {
      const conversa = criarConversa(status);
      conversa.moverPara("resolvida", USUARIO_ID, AGORA);
      expect(conversa.status).toBe("resolvida");
      expect(conversa.finalizadaEm).toBe(AGORA);
    },
  );

  it.each<StatusConversa>(["aguardando_humano", "em_atendimento", "aguardando_forms"])(
    "%s -> encaminhado é permitido via drag",
    (status) => {
      const conversa = criarConversa(status);
      conversa.moverPara("encaminhado", USUARIO_ID, AGORA);
      expect(conversa.status).toBe("encaminhado");
    },
  );

  it("rejeita 'encaminhado' como alvo do drag a partir de aguardando_cliente", () => {
    const conversa = criarConversa("aguardando_cliente");
    expect(() => conversa.moverPara("encaminhado", USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
  });

  it("nunca aceita 'ativa' como alvo do drag genérico (só devolverParaBot pode)", () => {
    const conversa = criarConversa("em_atendimento");
    expect(() => conversa.moverPara("ativa", USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
  });

  it.each<StatusConversa>(["em_atendimento", "ativa"])(
    "%s -> aguardando_financeiro é permitido via drag (encaminhar pro financeiro)",
    (status) => {
      const conversa = criarConversa(status);
      conversa.moverPara("aguardando_financeiro", USUARIO_ID, AGORA);
      expect(conversa.status).toBe("aguardando_financeiro");
    },
  );

  it("rejeita 'aguardando_financeiro' como alvo do drag a partir de aguardando_cliente", () => {
    const conversa = criarConversa("aguardando_cliente");
    expect(() => conversa.moverPara("aguardando_financeiro", USUARIO_ID, AGORA)).toThrow(TransicaoDeStatusInvalida);
  });

  it("aguardando_financeiro -> resolvida NÃO é permitido via drag genérico (o caminho é ConfirmarPagamento -> pagamento_aprovado, depois o n8n resolve)", () => {
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

  it.each<StatusConversa>(["em_atendimento", "ativa"])(
    "reporta true para aguardando_financeiro a partir de %s",
    (status) => {
      expect(criarConversa(status).podeTransicionarPara("aguardando_financeiro")).toBe(true);
    },
  );

  it("reporta false para aguardando_financeiro a partir de aguardando_cliente", () => {
    expect(criarConversa("aguardando_cliente").podeTransicionarPara("aguardando_financeiro")).toBe(false);
  });

  it("reporta true para encaminhado a partir de aguardando_humano, em_atendimento ou aguardando_forms", () => {
    expect(criarConversa("aguardando_humano").podeTransicionarPara("encaminhado")).toBe(true);
    expect(criarConversa("em_atendimento").podeTransicionarPara("encaminhado")).toBe(true);
    expect(criarConversa("aguardando_forms").podeTransicionarPara("encaminhado")).toBe(true);
    expect(criarConversa("aguardando_cliente").podeTransicionarPara("encaminhado")).toBe(false);
  });

  it("reporta true para resolvida a partir de encaminhado", () => {
    expect(criarConversa("encaminhado").podeTransicionarPara("resolvida")).toBe(true);
  });

  it("não altera estado (é side-effect free)", () => {
    const conversa = criarConversa("em_atendimento");
    conversa.podeTransicionarPara("resolvida");
    expect(conversa.status).toBe("em_atendimento");
    expect(conversa.extrairEventosPendentes()).toEqual([]);
  });
});
