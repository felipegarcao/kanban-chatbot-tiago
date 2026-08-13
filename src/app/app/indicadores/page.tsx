"use client";

import { EmptyState } from "@/presentation/ui/components/EmptyState";
import { IndicadoresPainel } from "@/presentation/ui/features/indicadores/IndicadoresPainel";
import { useSistemaSelecionado } from "@/presentation/ui/features/sistemas/SistemaSelecionadoContext";

export default function IndicadoresPage() {
  const { sistemaId, carregando } = useSistemaSelecionado();

  if (carregando) return null;

  if (sistemaId === null) {
    return (
      <div className="p-4">
        <EmptyState
          titulo="Nenhum projeto disponível"
          descricao="Peça a um administrador para conceder acesso a um projeto."
        />
      </div>
    );
  }

  return (
    <div className="h-full" key={sistemaId}>
      <IndicadoresPainel sistemaId={sistemaId} />
    </div>
  );
}
