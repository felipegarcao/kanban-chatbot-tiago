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
      // Zera tudo antes de guardar a identidade nova — sem isso, dados em cache da sessão
      // anterior (outro usuário, outras permissões) podem aparecer por um instante e disparar
      // erros de permissão na tela até as novas consultas assentarem.
      queryClient.clear();
      queryClient.setQueryData(["usuario-logado"], usuario);
    },
  });
}
