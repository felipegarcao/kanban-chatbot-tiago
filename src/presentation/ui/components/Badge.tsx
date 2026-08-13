import type { ReactNode } from "react";

type Tom = "neutro" | "critico" | "acento";

const CLASSES_TOM: Record<Tom, string> = {
  neutro: "bg-border/60 text-muted",
  critico: "bg-critical/15 text-critical",
  acento: "bg-accent/15 text-accent",
};

export function Badge({ children, tom = "neutro" }: { children: ReactNode; tom?: Tom }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CLASSES_TOM[tom]}`}>
      {children}
    </span>
  );
}
