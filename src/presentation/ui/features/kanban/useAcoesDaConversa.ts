import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";

function useInvalidacaoAposAcao() {
  const queryClient = useQueryClient();
  return (conversaId: number) => {
    queryClient.invalidateQueries({ queryKey: ["conversa-detalhe", conversaId] });
    queryClient.invalidateQueries({ queryKey: ["conversas"] });
    queryClient.invalidateQueries({ queryKey: ["contagens"] });
  };
}

export function useAssumirConversa() {
  const invalidar = useInvalidacaoAposAcao();
  return useMutation({
    mutationFn: (conversaId: number) => httpClient.post(`/api/conversas/${conversaId}/assumir`),
    onSuccess: (_data, conversaId) => invalidar(conversaId),
  });
}

export function useDevolverParaBot() {
  const invalidar = useInvalidacaoAposAcao();
  return useMutation({
    mutationFn: (conversaId: number) => httpClient.post(`/api/conversas/${conversaId}/devolver-para-bot`),
    onSuccess: (_data, conversaId) => invalidar(conversaId),
  });
}

export function useMoverParaGenerico() {
  const invalidar = useInvalidacaoAposAcao();
  return useMutation({
    mutationFn: ({ conversaId, novoStatus }: { conversaId: number; novoStatus: string }) =>
      httpClient.post(`/api/conversas/${conversaId}/mover`, { novoStatus }),
    onSuccess: (_data, variables) => invalidar(variables.conversaId),
  });
}
