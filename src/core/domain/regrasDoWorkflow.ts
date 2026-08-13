import type { StatusConversa } from "./Conversa";

/**
 * O workflow do n8n silencia o bot (para de responder automaticamente no WhatsApp) quando a
 * conversa está em um destes status. `aguardando_cliente` e `resolvida` NÃO silenciam — é
 * assim que o contrato com o n8n está documentado (§12), mesmo que pareça contraintuitivo.
 * `pagamento_aprovado` e `aguardando_forms` também silenciam: do momento em que o pagamento
 * é confirmado até o n8n finalizar via webhook (envio e confirmação do formulário), o bot
 * não deve falar com o cliente. Usado só para avisar o operador na UI; não é regra de transição.
 */
const STATUS_QUE_SILENCIAM_O_BOT: ReadonlySet<StatusConversa> = new Set([
  "aguardando_humano",
  "aguardando_financeiro",
  "em_atendimento",
  "pagamento_aprovado",
  "aguardando_forms",
]);

export function silenciaBot(status: StatusConversa): boolean {
  return STATUS_QUE_SILENCIAM_O_BOT.has(status);
}
