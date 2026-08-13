"use client";

import { useRef, useState, type ReactNode, type TouchEvent as ReactTouchEvent } from "react";

const LIMIAR_PX = 60;

export function PullToRefresh({ onRefresh, children }: { onRefresh: () => void; children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const [puxando, setPuxando] = useState(false);
  const [distancia, setDistancia] = useState(0);

  function handleTouchStart(e: ReactTouchEvent<HTMLDivElement>) {
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      startY.current = e.touches[0]!.clientY;
      setPuxando(true);
    }
  }

  function handleTouchMove(e: ReactTouchEvent<HTMLDivElement>) {
    if (!puxando) return;
    const delta = e.touches[0]!.clientY - startY.current;
    if (delta > 0) setDistancia(Math.min(delta, 100));
  }

  function handleTouchEnd() {
    if (distancia > LIMIAR_PX) onRefresh();
    setPuxando(false);
    setDistancia(0);
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto overscroll-contain"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {distancia > 0 && (
        <div
          style={{ height: distancia }}
          className="flex items-center justify-center text-xs text-muted transition-[height]"
        >
          {distancia > LIMIAR_PX ? "Solte para atualizar" : "Puxe para atualizar"}
        </div>
      )}
      {children}
    </div>
  );
}
