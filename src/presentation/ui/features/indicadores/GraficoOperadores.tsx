import { formatarNumero } from "./formatadores";
import type { DesempenhoOperador } from "@/core/application/ports/IndicadoresRepository";

const COR_ASSUMIDAS = "var(--color-chart-1)";
const COR_RESOLVIDAS = "var(--color-chart-2)";

/** Duas medidas na mesma escala (contagem) por operador — eixo único, nunca duplo-eixo. */
export function GraficoOperadores({ operadores }: { operadores: DesempenhoOperador[] }) {
  if (operadores.length === 0) {
    return <p className="py-10 text-center text-sm text-muted">Sem atividade de operadores no período.</p>;
  }

  const maiorValor = Math.max(1, ...operadores.flatMap((o) => [o.assumidas, o.resolvidas]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COR_ASSUMIDAS }} />
          Assumidas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COR_RESOLVIDAS }} />
          Resolvidas
        </span>
      </div>

      <ul className="flex flex-col gap-3">
        {operadores.map((op) => (
          <li key={op.usuarioId}>
            <p className="mb-1 truncate text-sm font-medium text-foreground">{op.nome}</p>
            <div className="flex flex-col gap-1">
              {[
                { chave: "assumidas", valor: op.assumidas, cor: COR_ASSUMIDAS },
                { chave: "resolvidas", valor: op.resolvidas, cor: COR_RESOLVIDAS },
              ].map((serie) => (
                <div key={serie.chave} className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <div className="h-3.5 overflow-hidden rounded-[4px] bg-border/40">
                    <div
                      className="h-full rounded-r-[4px]"
                      style={{ width: `${(serie.valor / maiorValor) * 100}%`, backgroundColor: serie.cor }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted">{formatarNumero(serie.valor)}</span>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
