import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  senha: z.string().min(1, "Senha obrigatória"),
});

export const registrarSchema = z.object({
  nome: z.string().trim().min(1, "Nome obrigatório"),
  email: z.string().trim().email("Email inválido"),
  senha: z.string().min(8, "Senha precisa ter pelo menos 8 caracteres"),
});
