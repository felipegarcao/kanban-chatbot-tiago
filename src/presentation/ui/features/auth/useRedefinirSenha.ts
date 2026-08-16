import { useMutation } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";

export interface RedefinirSenhaInput {
  email: string;
  senhaNova: string;
  confirmarSenha: string;
}

export function useRedefinirSenha() {
  return useMutation({
    mutationFn: (input: RedefinirSenhaInput) => httpClient.post<{ ok: true }>("/api/auth/redefinir-senha", input),
  });
}
