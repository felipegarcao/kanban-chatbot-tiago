import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";
import type { UsuarioSessao } from "./types";

export function useUsuarioLogado() {
  return useQuery({
    queryKey: ["usuario-logado"],
    queryFn: () => httpClient.get<UsuarioSessao>("/api/auth/me"),
    retry: false,
  });
}
