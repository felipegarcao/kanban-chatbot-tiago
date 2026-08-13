import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";
import type { DetalheConversa } from "./types";

export function useDetalheConversa(conversaId: number | null) {
  return useQuery({
    queryKey: ["conversa-detalhe", conversaId],
    queryFn: () => httpClient.get<DetalheConversa>(`/api/conversas/${conversaId}`),
    enabled: conversaId !== null,
  });
}
