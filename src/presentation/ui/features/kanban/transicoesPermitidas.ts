import { Conversa, type StatusConversa } from "@/core/domain/Conversa";

/**
 * Reaproveita a regra de domínio (Conversa.podeTransicionarPara) pra decidir quais opções
 * mostrar no menu "mover para" de cada card — o front pergunta pro domínio em vez de
 * duplicar a tabela de transições. A imposição de verdade continua no backend.
 */
export function alvosPermitidos(statusAtual: StatusConversa): StatusConversa[] {
  const conversa = Conversa.reconstituir({
    id: 0,
    sistemaId: 0,
    bot: null,
    contatoNome: null,
    contatoTelefone: null,
    status: statusAtual,
    estado: null,
    prioridade: null,
    iniciadaEm: null,
    ultimaMensagemEm: null,
    assumidaEm: null,
  });

  const TODOS: StatusConversa[] = [
    "ativa",
    "aguardando_humano",
    "aguardando_financeiro",
    "em_atendimento",
    "aguardando_cliente",
    "pagamento_aprovado",
    "aguardando_forms",
    "encaminhado",
    "resolvida",
  ];

  return TODOS.filter((status) => conversa.podeTransicionarPara(status));
}
