export function EmptyState({ titulo, descricao }: { titulo: string; descricao?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border px-4 py-8 text-center">
      <p className="text-sm font-medium text-foreground">{titulo}</p>
      {descricao && <p className="text-sm text-muted">{descricao}</p>}
    </div>
  );
}
