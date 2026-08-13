import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { httpClient } from "@/presentation/ui/lib/httpClient";
import type { StatusConversa } from "@/core/domain/Conversa";
import type { ConversaResumo, PaginaConversasResumo } from "./types";

interface MoverConversaInput {
  conversa: ConversaResumo;
  novoStatus: StatusConversa;
}

type CacheConversas = InfiniteData<PaginaConversasResumo, string | null>;

/**
 * Drag-and-drop otimista: move o card entre os caches das colunas antes da resposta do
 * servidor chegar. Se a API recusar (ex.: conflito de concorrência com o n8n), desfaz e o
 * card volta pra onde estava — nunca fica "preso" na coluna errada silenciosamente.
 */
export function useMoverConversa(sistemaId: number, busca: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversa, novoStatus }: MoverConversaInput) =>
      httpClient.post<{ status: StatusConversa }>(`/api/conversas/${conversa.id}/mover`, { novoStatus }),

    onMutate: async ({ conversa, novoStatus }) => {
      const origemKey = ["conversas", sistemaId, conversa.status, busca];
      const destinoKey = ["conversas", sistemaId, novoStatus, busca];
      const contagensKey = ["contagens", sistemaId];

      await Promise.all([
        queryClient.cancelQueries({ queryKey: origemKey }),
        queryClient.cancelQueries({ queryKey: destinoKey }),
      ]);

      const origemAnterior = queryClient.getQueryData<CacheConversas>(origemKey);
      const destinoAnterior = queryClient.getQueryData<CacheConversas>(destinoKey);
      const contagensAnteriores = queryClient.getQueryData<Record<string, number>>(contagensKey);

      queryClient.setQueryData<CacheConversas>(origemKey, (old) => {
        if (!old) return old;
        return { ...old, pages: old.pages.map((p) => ({ ...p, itens: p.itens.filter((c) => c.id !== conversa.id) })) };
      });

      queryClient.setQueryData<CacheConversas>(destinoKey, (old) => {
        const conversaAtualizada: ConversaResumo = { ...conversa, status: novoStatus };
        if (!old || old.pages.length === 0) {
          return { pages: [{ itens: [conversaAtualizada], proximoCursor: null }], pageParams: [null] };
        }
        const [primeira, ...resto] = old.pages;
        return { ...old, pages: [{ ...primeira!, itens: [conversaAtualizada, ...primeira!.itens] }, ...resto] };
      });

      queryClient.setQueryData<Record<string, number>>(contagensKey, (old) =>
        old
          ? {
              ...old,
              [conversa.status]: Math.max(0, (old[conversa.status] ?? 0) - 1),
              [novoStatus]: (old[novoStatus] ?? 0) + 1,
            }
          : old,
      );

      return { origemKey, destinoKey, contagensKey, origemAnterior, destinoAnterior, contagensAnteriores };
    },

    onError: (_erro, _vars, contexto) => {
      if (!contexto) return;
      queryClient.setQueryData(contexto.origemKey, contexto.origemAnterior);
      queryClient.setQueryData(contexto.destinoKey, contexto.destinoAnterior);
      queryClient.setQueryData(contexto.contagensKey, contexto.contagensAnteriores);
    },

    onSettled: (_data, _erro, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversas", sistemaId, variables.conversa.status] });
      queryClient.invalidateQueries({ queryKey: ["conversas", sistemaId, variables.novoStatus] });
      queryClient.invalidateQueries({ queryKey: ["contagens", sistemaId] });
    },
  });
}
