import { z } from "zod";
import { statusConversaSchema } from "./conversas";

export const criarProjetoSchema = z.object({
  nome: z.string().trim().min(1),
  descricao: z.string().trim().nullable().default(null),
});

export const editarProjetoSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  descricao: z.string().trim().nullable().optional(),
  ativo: z.boolean().optional(),
});

export const criarUsuarioSchema = z.object({
  nome: z.string().trim().min(1),
  email: z.string().trim().email(),
  senha: z.string().min(8, "Senha precisa ter pelo menos 8 caracteres"),
  papel: z.enum(["admin", "operador"]),
});

export const editarUsuarioSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  papel: z.enum(["admin", "operador"]).optional(),
  ativo: z.boolean().optional(),
});

export const concederAcessoSchema = z.object({
  sistemaId: z.number().int().positive(),
});

export const configuracaoColunaSchema = z.object({
  chave: statusConversaSchema,
  titulo: z.string().trim().min(1),
  cor: z.string().trim().min(1),
  ordem: z.number().int(),
  visivel: z.boolean(),
});

export const configurarColunasSchema = z.object({
  colunas: z.array(configuracaoColunaSchema).min(1),
});
