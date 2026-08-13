"use client";

import { useSistemaSelecionado } from "@/presentation/ui/features/sistemas/SistemaSelecionadoContext";

export function SistemaSelector() {
  const { sistemaId, projetos, carregando, selecionar } = useSistemaSelecionado();

  if (carregando) {
    return <div className="h-9 w-40 animate-pulse rounded-md bg-border/60" aria-hidden="true" />;
  }

  if (projetos.length === 0) return null;

  if (projetos.length === 1) {
    return <span className="text-sm font-medium text-foreground">{projetos[0]!.nome}</span>;
  }

  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Projeto</span>
      <select
        value={sistemaId ?? ""}
        onChange={(e) => selecionar(Number(e.target.value))}
        className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm font-medium text-foreground
          focus-visible:outline-2 focus-visible:outline-ring"
      >
        {projetos.map((projeto) => (
          <option key={projeto.id} value={projeto.id}>
            {projeto.nome}
          </option>
        ))}
      </select>
    </label>
  );
}
