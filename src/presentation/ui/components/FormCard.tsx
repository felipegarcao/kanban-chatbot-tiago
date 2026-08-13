import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface FormCardProps {
  titulo: string;
  descricao?: string;
  voltarHref: string;
  voltarRotulo: string;
  children: ReactNode;
  rodape?: ReactNode;
}

export function FormCard({ titulo, descricao, voltarHref, voltarRotulo, children, rodape }: FormCardProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <Link href={voltarHref} className="inline-flex w-fit items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={15} aria-hidden="true" />
        {voltarRotulo}
      </Link>

      <div>
        <h1 className="text-lg font-semibold text-foreground">{titulo}</h1>
        {descricao && <p className="mt-0.5 text-sm text-muted">{descricao}</p>}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">{children}</div>

      {rodape}
    </div>
  );
}
