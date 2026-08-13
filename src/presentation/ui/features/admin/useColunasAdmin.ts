import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";
import type { ColunaResumo } from "@/presentation/ui/features/kanban/types";

export function useColunasAdmin(sistemaId: number | null) {
  return useQuery({
    queryKey: ["colunas-admin", sistemaId],
    queryFn: () => httpClient.get<ColunaResumo[]>(`/api/sistemas/${sistemaId}/colunas?todas=1`),
    enabled: sistemaId !== null,
  });
}

export function useConfigurarColunas(sistemaId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (colunas: ColunaResumo[]) =>
      httpClient.put(`/api/sistemas/${sistemaId}/colunas`, {
        colunas: colunas.map(({ chave, titulo, cor, ordem, visivel }) => ({ chave, titulo, cor, ordem, visivel })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colunas-admin", sistemaId] });
      queryClient.invalidateQueries({ queryKey: ["colunas", sistemaId] });
    },
  });
}
