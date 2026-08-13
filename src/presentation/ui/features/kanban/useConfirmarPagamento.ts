import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";

export interface ConfirmarPagamentoInput {
  conversaId: number;
  valor?: number;
  observacao?: string;
}

export function useConfirmarPagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversaId, ...body }: ConfirmarPagamentoInput) =>
      httpClient.post(`/api/conversas/${conversaId}/confirmar-pagamento`, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversa-detalhe", variables.conversaId] });
      queryClient.invalidateQueries({ queryKey: ["conversas"] });
      queryClient.invalidateQueries({ queryKey: ["contagens"] });
    },
  });
}
