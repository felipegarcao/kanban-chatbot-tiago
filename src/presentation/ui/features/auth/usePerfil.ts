import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";

export interface AtualizarPerfilInput {
  nome?: string;
  email?: string;
}

export function useAtualizarPerfil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AtualizarPerfilInput) => httpClient.patch("/api/perfil", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["usuario-logado"] }),
  });
}

export interface AlterarSenhaInput {
  senhaAtual: string;
  senhaNova: string;
}

export function useAlterarSenha() {
  return useMutation({
    mutationFn: (input: AlterarSenhaInput) => httpClient.patch("/api/perfil/senha", input),
  });
}
