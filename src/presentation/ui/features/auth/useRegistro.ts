import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";
import type { UsuarioSessao } from "./types";

export interface RegistroInput {
  nome: string;
  email: string;
  senha: string;
}

export function useRegistro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegistroInput) => httpClient.post<UsuarioSessao>("/api/auth/registrar", input),
    onSuccess: (usuario) => {
      // Mesmo raciocínio do login: zera o cache antes de guardar a identidade nova, senão
      // dados de uma sessão anterior no mesmo navegador podem vazar por um instante.
      queryClient.clear();
      queryClient.setQueryData(["usuario-logado"], usuario);
    },
  });
}
