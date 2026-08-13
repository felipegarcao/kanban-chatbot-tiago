"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface ModalProps {
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
  fecharBloqueado?: boolean;
}

export function Modal({ titulo, onFechar, children, fecharBloqueado }: ModalProps) {
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape" && !fecharBloqueado) onFechar();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onFechar, fecharBloqueado]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => !fecharBloqueado && onFechar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">{titulo}</h2>
          <button
            type="button"
            onClick={onFechar}
            disabled={fecharBloqueado}
            aria-label="Fechar"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-border/40 hover:text-foreground disabled:opacity-40"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
