import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";

const INTERVALO_POLLING_MS = 30_000;

export function useContagens(sistemaId: number | null) {
  return useQuery({
    queryKey: ["contagens", sistemaId],
    queryFn: () => httpClient.get<Record<string, number>>(`/api/sistemas/${sistemaId}/conversas/contagens`),
    enabled: sistemaId !== null,
    refetchInterval: INTERVALO_POLLING_MS,
  });
}
