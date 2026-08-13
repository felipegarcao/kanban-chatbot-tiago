import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";
import type { IntervaloDeDatas } from "@/presentation/ui/lib/dateRange";
import type { Indicadores } from "@/core/application/ports/IndicadoresRepository";

export function useIndicadores(sistemaId: number | null, intervalo: IntervaloDeDatas) {
  return useQuery({
    queryKey: ["indicadores", sistemaId, intervalo.de, intervalo.ate],
    queryFn: () =>
      httpClient.get<Indicadores>(`/api/sistemas/${sistemaId}/indicadores?de=${intervalo.de}&ate=${intervalo.ate}`),
    enabled: sistemaId !== null,
  });
}
