import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";

export function useDeletarProjeto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sistemaId: number) => httpClient.delete(`/api/sistemas/${sistemaId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sistemas"] }),
  });
}
