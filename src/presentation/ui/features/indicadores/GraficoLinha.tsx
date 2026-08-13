"use client";

import { useMemo, useRef, useState, type MouseEvent } from "react";
import { formatarDataCurta, formatarNumero } from "./formatadores";
import type { VolumeDoDia } from "@/core/application/ports/IndicadoresRepository";

const LARGURA = 640;
const ALTURA = 200;
const MARGEM = { topo: 16, direita: 12, baixo: 26, esquerda: 34 };
const PLOT_W = LARGURA - MARGEM.esquerda - MARGEM.direita;
const PLOT_H = ALTURA - MARGEM.topo - MARGEM.baixo;

/** Arredonda pra cima pro próximo número "redondo" (1/2/2.5/5/10 × potência de 10) — teto do eixo Y. */
function tetoAgradavel(valor: number): number {
  if (valor <= 0) return 4;
  const grandeza = 10 ** Math.floor(Math.log10(valor));
  for (const passo of [1, 2, 2.5, 5, 10]) {
    const candidato = passo * grandeza;
    if (candidato >= valor) return candidato;
  }
  return 10 * grandeza;
}

/**
 * Série única (volume de conversas por dia) — sem legenda (o título já diz o que é plotado),
 * linha 2px, marcador ≥8px no fim com anel na cor da superfície, wash de área a 10%, crosshair
 * + tooltip no hover, grade horizontal recessiva.
 */
export function GraficoLinha({ pontos, titulo }: { pontos: VolumeDoDia[]; titulo: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indiceAtivo, setIndiceAtivo] = useState<number | null>(null);
  const maiorValor = useMemo(() => tetoAgradavel(Math.max(0, ...pontos.map((p) => p.total))), [pontos]);

  if (pontos.length === 0) {
    return <p className="py-10 text-center text-sm text-muted">Sem dados no período.</p>;
  }

  function x(i: number): number {
    return pontos.length <= 1 ? MARGEM.esquerda + PLOT_W / 2 : MARGEM.esquerda + (i / (pontos.length - 1)) * PLOT_W;
  }
  function y(valor: number): number {
    return MARGEM.topo + PLOT_H - (valor / maiorValor) * PLOT_H;
  }

  const linha = pontos.map((p, i) => `${x(i)},${y(p.total)}`).join(" ");
  const area =
    pontos.length > 1
      ? `${MARGEM.esquerda},${MARGEM.topo + PLOT_H} ${linha} ${x(pontos.length - 1)},${MARGEM.topo + PLOT_H}`
      : "";
  const ticksY = [0, maiorValor / 2, maiorValor];
  const passoX = Math.max(1, Math.ceil(pontos.length / 6));
  const ultimo = pontos[pontos.length - 1]!;
  const ativo = indiceAtivo !== null ? pontos[indiceAtivo] : null;

  function aoMoverMouse(e: MouseEvent<SVGRectElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const relX = ((e.clientX - rect.left) / rect.width) * LARGURA;
    const posicao = ((relX - MARGEM.esquerda) / PLOT_W) * (pontos.length - 1);
    setIndiceAtivo(Math.min(pontos.length - 1, Math.max(0, Math.round(posicao))));
  }

  return (
    <div ref={containerRef} className="relative">
      <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} className="w-full" role="img" aria-label={titulo}>
        {ticksY.map((t) => (
          <g key={t}>
            <line
              x1={MARGEM.esquerda}
              x2={LARGURA - MARGEM.direita}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
            <text x={MARGEM.esquerda - 6} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="var(--color-muted)">
              {formatarNumero(Math.round(t))}
            </text>
          </g>
        ))}

        {pontos.map(
          (p, i) =>
            (i % passoX === 0 || i === pontos.length - 1) && (
              <text key={p.data} x={x(i)} y={ALTURA - 8} textAnchor="middle" fontSize={9} fill="var(--color-muted)">
                {formatarDataCurta(p.data)}
              </text>
            ),
        )}

        {area && <polygon points={area} fill="var(--color-chart-1)" opacity={0.1} />}
        {pontos.length > 1 && (
          <polyline points={linha} fill="none" stroke="var(--color-chart-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        )}

        <circle cx={x(pontos.length - 1)} cy={y(ultimo.total)} r={4} fill="var(--color-chart-1)" stroke="var(--color-surface)" strokeWidth={2} />
        <text x={x(pontos.length - 1)} y={y(ultimo.total) - 10} textAnchor="end" fontSize={10} fontWeight={600} fill="var(--color-foreground)">
          {formatarNumero(ultimo.total)}
        </text>

        {ativo && indiceAtivo !== null && (
          <g>
            <line x1={x(indiceAtivo)} x2={x(indiceAtivo)} y1={MARGEM.topo} y2={MARGEM.topo + PLOT_H} stroke="var(--color-muted)" strokeWidth={1} opacity={0.4} />
            <circle cx={x(indiceAtivo)} cy={y(ativo.total)} r={4} fill="var(--color-chart-1)" stroke="var(--color-surface)" strokeWidth={2} />
          </g>
        )}

        <rect
          x={MARGEM.esquerda}
          y={MARGEM.topo}
          width={PLOT_W}
          height={PLOT_H}
          fill="transparent"
          onMouseMove={aoMoverMouse}
          onMouseLeave={() => setIndiceAtivo(null)}
        />
      </svg>

      {ativo && indiceAtivo !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-surface-raised px-2 py-1 text-xs shadow-lg"
          style={{ left: `${(x(indiceAtivo) / LARGURA) * 100}%`, top: `${(y(ativo.total) / ALTURA) * 100 - 2}%` }}
        >
          <p className="font-medium text-foreground">{formatarNumero(ativo.total)} conversas</p>
          <p className="text-muted">{formatarDataCurta(ativo.data)}</p>
        </div>
      )}
    </div>
  );
}
