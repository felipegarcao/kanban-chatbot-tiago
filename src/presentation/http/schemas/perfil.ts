import { z } from "zod";

export const atualizarPerfilSchema = z.object({
  nome: z.string().trim().min(1, "Nome obrigatório").optional(),
  email: z.string().trim().email("Email inválido").optional(),
});

export const alterarSenhaSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual obrigatória"),
  senhaNova: z.string().min(8, "Senha precisa ter pelo menos 8 caracteres"),
});
