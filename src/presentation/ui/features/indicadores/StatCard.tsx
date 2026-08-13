import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  rotulo: string;
  valor: string;
  subtitulo?: string;
  Icone: LucideIcon;
  tom?: "neutro" | "critico";
}

/** Contrato de stat tile da skill dataviz: label + valor em algarismos proporcionais (não tabular). */
export function StatCard({ rotulo, valor, subtitulo, Icone, tom = "neutro" }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{rotulo}</span>
        <Icone size={16} className={tom === "critico" ? "text-critical" : "text-muted"} aria-hidden="true" />
      </div>
      <p className={`text-2xl font-semibold ${tom === "critico" ? "text-critical" : "text-foreground"}`}>{valor}</p>
      {subtitulo && <p className="text-xs text-muted">{subtitulo}</p>}
    </div>
  );
}
