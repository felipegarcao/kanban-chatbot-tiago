"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useProjetos } from "./useProjetos";
import type { ProjetoResumo } from "./types";

const CHAVE_STORAGE = "painel:sistemaSelecionadoId";

interface SistemaSelecionadoValue {
  sistemaId: number | null;
  projetos: ProjetoResumo[];
  carregando: boolean;
  selecionar: (id: number) => void;
}

const Contexto = createContext<SistemaSelecionadoValue | null>(null);

function lerSalvo(): number | null {
  if (typeof window === "undefined") return null;
  const valor = Number(sessionStorage.getItem(CHAVE_STORAGE));
  return Number.isFinite(valor) && valor > 0 ? valor : null;
}

export function SistemaSelecionadoProvider({ children }: { children: ReactNode }) {
  const { data: projetos, isPending } = useProjetos();
  const [selecaoManual, setSelecaoManual] = useState<number | null>(null);

  const sistemaId = useMemo(() => {
    if (!projetos || projetos.length === 0) return null;
    if (selecaoManual !== null && projetos.some((p) => p.id === selecaoManual)) return selecaoManual;
    const salvo = lerSalvo();
    if (salvo !== null && projetos.some((p) => p.id === salvo)) return salvo;
    return projetos[0]!.id;
  }, [projetos, selecaoManual]);

  function selecionar(id: number) {
    setSelecaoManual(id);
    sessionStorage.setItem(CHAVE_STORAGE, String(id));
  }

  const value = useMemo<SistemaSelecionadoValue>(
    () => ({ sistemaId, projetos: projetos ?? [], carregando: isPending, selecionar }),
    [sistemaId, projetos, isPending],
  );

  return <Contexto.Provider value={value}>{children}</Contexto.Provider>;
}

export function useSistemaSelecionado(): SistemaSelecionadoValue {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useSistemaSelecionado precisa estar dentro de SistemaSelecionadoProvider");
  return ctx;
}
