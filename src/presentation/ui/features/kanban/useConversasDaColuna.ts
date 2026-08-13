import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";
import type { PaginaConversasResumo } from "./types";
import type { StatusConversa } from "@/core/domain/Conversa";

const INTERVALO_POLLING_MS = 30_000;

export function useConversasDaColuna(sistemaId: number | null, status: StatusConversa, busca: string) {
  return useInfiniteQuery({
    queryKey: ["conversas", sistemaId, status, busca],
    queryFn: ({ pageParam }) => {
      const url = new URL(`/api/sistemas/${sistemaId}/conversas`, window.location.origin);
      url.searchParams.set("status", status);
      if (busca.trim()) url.searchParams.set("busca", busca.trim());
      if (pageParam) url.searchParams.set("cursor", pageParam);
      return httpClient.get<PaginaConversasResumo>(url.pathname + url.search);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (ultimaPagina) => ultimaPagina.proximoCursor,
    enabled: sistemaId !== null,
    refetchInterval: INTERVALO_POLLING_MS,
  });
}
