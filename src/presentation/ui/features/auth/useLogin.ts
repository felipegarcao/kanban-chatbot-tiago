import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";
import type { UsuarioSessao } from "./types";

export interface LoginInput {
  email: string;
  senha: string;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => httpClient.post<UsuarioSessao>("/api/auth/login", input),
    onSuccess: (usuario) => {
      queryClient.setQueryData(["usuario-logado"], usuario);
    },
  });
}
