import type { PrioridadeConversa, StatusConversa } from "@/core/domain/Conversa";

export const ROTULO_STATUS: Record<StatusConversa, string> = {
  ativa: "Ativa (bot)",
  aguardando_humano: "Aguardando humano",
  aguardando_financeiro: "Aguardando financeiro",
  em_atendimento: "Em atendimento",
  aguardando_cliente: "Aguardando cliente",
  pagamento_aprovado: "Pagamento aprovado",
  aguardando_forms: "Aguardando formulário",
  resolvida: "Resolvida",
};

/**
 * Ordem fixa (mesma do funil de atendimento, reaproveitada de transicoesPermitidas.ts) —
 * cor e posição seguem essa ordem sempre, nunca a contagem do período. Um filtro que muda
 * quais status aparecem não pode repintar os que sobraram.
 */
export const ORDEM_STATUS: StatusConversa[] = [
  "ativa",
  "aguardando_humano",
  "aguardando_financeiro",
  "em_atendimento",
  "aguardando_cliente",
  "pagamento_aprovado",
  "aguardando_forms",
  "resolvida",
];

/** Slot categórico fixo (paleta validada em globals.css) — índice = posição em ORDEM_STATUS. */
export const COR_STATUS: Record<StatusConversa, string> = {
  ativa: "var(--color-chart-1)",
  aguardando_humano: "var(--color-chart-2)",
  aguardando_financeiro: "var(--color-chart-3)",
  em_atendimento: "var(--color-chart-4)",
  aguardando_cliente: "var(--color-chart-5)",
  pagamento_aprovado: "var(--color-chart-6)",
  aguardando_forms: "var(--color-chart-7)",
  resolvida: "var(--color-chart-8)",
};

/**
 * chart-3/chart-4/chart-5 (aqua/amarelo/magenta) tiveram WARN de contraste no modo claro na
 * validação da paleta — por regra da skill dataviz, esses slots exigem rótulo direto visível
 * sempre, nunca podem depender só da cor pra se distinguir.
 */
export const STATUS_COM_CONTRASTE_BAIXO = new Set<StatusConversa>([
  "aguardando_financeiro",
  "em_atendimento",
  "aguardando_cliente",
]);

export const ROTULO_PRIORIDADE: Record<PrioridadeConversa, string> = {
  normal: "Normal",
  critica: "Crítica",
};

/**
 * Prioridade é severidade, não identidade — usa a paleta de status (reservada) da própria app,
 * não um slot categórico arbitrário.
 */
export const COR_PRIORIDADE: Record<PrioridadeConversa, string> = {
  normal: "var(--color-success)",
  critica: "var(--color-critical)",
};
