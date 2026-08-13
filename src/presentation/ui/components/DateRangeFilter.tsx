"use client";

import { Calendar, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { validarIntervalo, type IntervaloDeDatas } from "@/presentation/ui/lib/dateRange";

interface PresetOpcao {
  rotulo: string;
  calcular: () => IntervaloDeDatas;
}

function paraISO(data: Date): string {
  return data.toISOString().slice(0, 10);
}

function diasAtras(n: number): IntervaloDeDatas {
  const ate = new Date();
  const de = new Date(ate);
  de.setDate(de.getDate() - n);
  return { de: paraISO(de), ate: paraISO(ate) };
}

const PRESETS: PresetOpcao[] = [
  { rotulo: "Hoje", calcular: () => ({ de: paraISO(new Date()), ate: paraISO(new Date()) }) },
  { rotulo: "Últimos 7 dias", calcular: () => diasAtras(7) },
  { rotulo: "Últimos 30 dias", calcular: () => diasAtras(30) },
  { rotulo: "Últimos 90 dias", calcular: () => diasAtras(90) },
  {
    rotulo: "Este mês",
    calcular: () => {
      const agora = new Date();
      const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
      return { de: paraISO(inicio), ate: paraISO(agora) };
    },
  },
];

function formatarRotulo(intervalo: IntervaloDeDatas): string {
  const opcoes: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  const de = new Date(`${intervalo.de}T00:00:00`).toLocaleDateString("pt-BR", opcoes);
  const ate = new Date(`${intervalo.ate}T00:00:00`).toLocaleDateString("pt-BR", opcoes);
  return `${de} – ${ate}`;
}

export function DateRangeFilter({
  value,
  onChange,
}: {
  value: IntervaloDeDatas;
  onChange: (intervalo: IntervaloDeDatas) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [rascunhoDe, setRascunhoDe] = useState(value.de);
  const [rascunhoAte, setRascunhoAte] = useState(value.ate);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setAberto(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  const erroRascunho = validarIntervalo(rascunhoDe, rascunhoAte);

  function aplicarPreset(preset: PresetOpcao) {
    onChange(preset.calcular());
    setAberto(false);
  }

  function aplicarCustom() {
    if (erroRascunho) return;
    onChange({ de: rascunhoDe, ate: rascunhoAte });
    setAberto(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          if (!aberto) {
            setRascunhoDe(value.de);
            setRascunhoAte(value.ate);
          }
          setAberto((a) => !a);
        }}
        aria-expanded={aberto}
        aria-haspopup="dialog"
        className="flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-border/40 sm:min-h-0"
      >
        <Calendar size={15} className="text-muted" aria-hidden="true" />
        {formatarRotulo(value)}
      </button>

      {aberto && (
        <div
          role="dialog"
          aria-label="Selecionar período"
          className="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl border border-border bg-surface p-1 shadow-xl"
        >
          <ul className="flex flex-col">
            {PRESETS.map((preset) => {
              const calculado = preset.calcular();
              const selecionado = calculado.de === value.de && calculado.ate === value.ate;
              return (
                <li key={preset.rotulo}>
                  <button
                    type="button"
                    onClick={() => aplicarPreset(preset)}
                    className="flex min-h-[40px] w-full items-center justify-between rounded-lg px-3 text-sm text-foreground hover:bg-border/40"
                  >
                    {preset.rotulo}
                    {selecionado && <Check size={16} className="text-accent" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-1 flex flex-col gap-2 border-t border-border p-2">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={rascunhoDe}
                max={rascunhoAte || undefined}
                onChange={(e) => setRascunhoDe(e.target.value)}
                aria-label="Data inicial"
                className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground"
              />
              <span className="text-muted">–</span>
              <input
                type="date"
                value={rascunhoAte}
                min={rascunhoDe || undefined}
                onChange={(e) => setRascunhoAte(e.target.value)}
                aria-label="Data final"
                className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground"
              />
            </div>
            {erroRascunho && (
              <p role="alert" className="text-xs text-critical">
                {erroRascunho}
              </p>
            )}
            <button
              type="button"
              onClick={aplicarCustom}
              disabled={Boolean(erroRascunho)}
              className="min-h-[36px] rounded-md bg-accent px-3 text-sm font-medium text-accent-foreground disabled:opacity-50"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
