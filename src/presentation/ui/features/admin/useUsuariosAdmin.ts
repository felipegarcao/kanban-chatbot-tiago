import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";
import type { Papel, UsuarioAdmin } from "./types";

export function useUsuariosAdmin() {
  return useQuery({
    queryKey: ["usuarios-admin"],
    queryFn: () => httpClient.get<UsuarioAdmin[]>("/api/usuarios"),
  });
}

export interface CriarUsuarioInput {
  nome: string;
  email: string;
  senha: string;
  papel: Papel;
}

export function useCriarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarUsuarioInput) => httpClient.post("/api/usuarios", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["usuarios-admin"] }),
  });
}

export interface EditarUsuarioInput {
  usuarioId: number;
  nome?: string;
  papel?: Papel;
  ativo?: boolean;
}

export function useEditarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ usuarioId, ...body }: EditarUsuarioInput) => httpClient.patch(`/api/usuarios/${usuarioId}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["usuarios-admin"] }),
  });
}

export function useConcederAcesso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ usuarioId, sistemaId }: { usuarioId: number; sistemaId: number }) =>
      httpClient.post(`/api/usuarios/${usuarioId}/acessos`, { sistemaId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["usuarios-admin"] }),
  });
}

export function useRevogarAcesso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ usuarioId, sistemaId }: { usuarioId: number; sistemaId: number }) =>
      httpClient.delete(`/api/usuarios/${usuarioId}/acessos/${sistemaId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["usuarios-admin"] }),
  });
}
