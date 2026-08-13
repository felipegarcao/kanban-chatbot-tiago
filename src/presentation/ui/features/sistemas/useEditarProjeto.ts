import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";

export interface EditarProjetoInput {
  sistemaId: number;
  nome?: string;
  descricao?: string | null;
  ativo?: boolean;
}

export function useEditarProjeto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sistemaId, ...body }: EditarProjetoInput) => httpClient.patch(`/api/sistemas/${sistemaId}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sistemas"] }),
  });
}
