import type { ReactNode } from "react";

export function ChartCard({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{titulo}</h3>
        {subtitulo && <p className="text-xs text-muted">{subtitulo}</p>}
      </div>
      {children}
    </div>
  );
}
