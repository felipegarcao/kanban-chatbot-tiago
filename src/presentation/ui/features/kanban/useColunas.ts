import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";
import type { ColunaResumo } from "./types";

export function useColunas(sistemaId: number | null) {
  return useQuery({
    queryKey: ["colunas", sistemaId],
    queryFn: () => httpClient.get<ColunaResumo[]>(`/api/sistemas/${sistemaId}/colunas`),
    enabled: sistemaId !== null,
  });
}
