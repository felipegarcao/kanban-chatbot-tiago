import { Inbox, type LucideIcon } from "lucide-react";

export function EmptyState({
  titulo,
  descricao,
  icone: Icone = Inbox,
}: {
  titulo: string;
  descricao?: string;
  icone?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-10 text-center">
      <Icone size={22} className="text-muted" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">{titulo}</p>
      {descricao && <p className="text-sm text-muted">{descricao}</p>}
    </div>
  );
}
