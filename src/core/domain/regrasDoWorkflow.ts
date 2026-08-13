import type { StatusConversa } from "./Conversa";

/**
 * O workflow do n8n silencia o bot (para de responder automaticamente no WhatsApp) quando a
 * conversa está em um destes três status. `aguardando_cliente` e `resolvida` NÃO silenciam —
 * é assim que o contrato com o n8n está documentado (§12), mesmo que pareça contraintuitivo.
 * Usado só para avisar o operador na UI; não é regra de transição.
 */
const STATUS_QUE_SILENCIAM_O_BOT: ReadonlySet<StatusConversa> = new Set([
  "aguardando_humano",
  "aguardando_financeiro",
  "em_atendimento",
]);

export function silenciaBot(status: StatusConversa): boolean {
  return STATUS_QUE_SILENCIAM_O_BOT.has(status);
}
