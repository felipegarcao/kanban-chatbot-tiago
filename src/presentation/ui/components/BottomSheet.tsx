"use client";

import { useEffect, type ReactNode } from "react";

interface BottomSheetProps {
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
}

export function BottomSheet({ titulo, onFechar, children }: BottomSheetProps) {
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onFechar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="w-full rounded-t-xl border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" aria-hidden="true" />
        <h2 className="text-base font-semibold text-foreground">{titulo}</h2>
        <div className="mt-3 flex flex-col gap-1">{children}</div>
      </div>
    </div>
  );
}
