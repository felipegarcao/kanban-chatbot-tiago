import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";
import type { ProjetoResumo } from "./types";

export interface CriarProjetoInput {
  nome: string;
  descricao: string | null;
}

export function useCriarProjeto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarProjetoInput) => httpClient.post<ProjetoResumo>("/api/sistemas", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sistemas"] }),
  });
}
