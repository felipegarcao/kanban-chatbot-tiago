import { z } from "zod";

const statusConversaSchema = z.enum([
  "ativa",
  "aguardando_humano",
  "aguardando_financeiro",
  "em_atendimento",
  "aguardando_cliente",
  "pagamento_aprovado",
  "aguardando_forms",
  "resolvida",
]);

export const moverConversaSchema = z.object({
  novoStatus: statusConversaSchema,
});

export const confirmarPagamentoSchema = z.object({
  valor: z.number().positive().optional(),
  observacao: z.string().trim().max(500).optional(),
});

export { statusConversaSchema };
