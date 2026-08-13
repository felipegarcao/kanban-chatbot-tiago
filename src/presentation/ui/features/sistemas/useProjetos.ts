import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";
import type { ProjetoResumo } from "./types";

export function useProjetos() {
  return useQuery({
    queryKey: ["sistemas"],
    queryFn: () => httpClient.get<ProjetoResumo[]>("/api/sistemas"),
  });
}
