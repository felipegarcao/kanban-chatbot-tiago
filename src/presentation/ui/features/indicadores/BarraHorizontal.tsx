import { formatarNumero, formatarPercentual } from "./formatadores";

export interface ItemBarra {
  chave: string;
  rotulo: string;
  valor: number;
  cor: string;
}

/**
 * Barras horizontais com rótulo e valor sempre visíveis diretamente (nunca só a cor carrega o
 * significado — obrigatório pros slots com WARN de contraste no claro, ver rotulos.ts) e um
 * gap de 2px na cor da superfície separando trilho preenchido do vazio.
 */
export function BarraHorizontal({
  itens,
  totalParaPercentual,
}: {
  itens: ItemBarra[];
  /** Quando informado, mostra "N (xx%)" ao lado de cada barra em vez de só N. */
  totalParaPercentual?: number;
}) {
  if (itens.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">Sem dados no período.</p>;
  }

  const maiorValor = Math.max(1, ...itens.map((i) => i.valor));

  return (
    <ul className="flex flex-col gap-2.5">
      {itens.map((item) => (
        <li key={item.chave} className="group grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3">
          <span className="truncate text-sm text-foreground" title={item.rotulo}>
            {item.rotulo}
          </span>
          <div className="h-5 overflow-hidden rounded-[4px] bg-border/40">
            <div
              className="h-full rounded-r-[4px] transition-[width]"
              style={{
                width: `${(item.valor / maiorValor) * 100}%`,
                backgroundColor: item.cor,
                boxShadow: "2px 0 0 0 var(--color-surface) inset",
              }}
            />
          </div>
          <span className="w-20 shrink-0 text-right text-sm tabular-nums text-muted">
            {formatarNumero(item.valor)}
            {totalParaPercentual !== undefined && (
              <span className="ml-1 text-xs">({formatarPercentual(item.valor, totalParaPercentual)})</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
