"use client";

import { EmptyState } from "@/presentation/ui/components/EmptyState";
import { KanbanBoard } from "@/presentation/ui/features/kanban/KanbanBoard";
import { MobileBoard } from "@/presentation/ui/features/kanban/MobileBoard";
import { useSistemaSelecionado } from "@/presentation/ui/features/sistemas/SistemaSelecionadoContext";

export default function AppPage() {
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
      <div className="hidden h-full md:block">
        <KanbanBoard sistemaId={sistemaId} />
      </div>
      <div className="h-full md:hidden">
        <MobileBoard sistemaId={sistemaId} />
      </div>
    </div>
  );
}
