import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";
import type { IntervaloDeDatas } from "@/presentation/ui/lib/dateRange";

const INTERVALO_POLLING_MS = 30_000;

export function useContagens(sistemaId: number | null, intervalo: IntervaloDeDatas) {
  return useQuery({
    queryKey: ["contagens", sistemaId, intervalo.de, intervalo.ate],
    queryFn: () =>
      httpClient.get<Record<string, number>>(
        `/api/sistemas/${sistemaId}/conversas/contagens?de=${intervalo.de}&ate=${intervalo.ate}`,
      ),
    enabled: sistemaId !== null,
    refetchInterval: INTERVALO_POLLING_MS,
  });
}
