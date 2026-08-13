import { type InputHTMLAttributes, forwardRef, useId } from "react";
import type { LucideIcon } from "lucide-react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  erro?: string;
  icone?: LucideIcon;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, erro, icone: Icone, id, className = "", ...rest },
  ref,
) {
  const idGerado = useId();
  const inputId = id ?? idGerado;
  const erroId = erro ? `${inputId}-erro` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        {Icone && (
          <Icone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(erro)}
          aria-describedby={erroId}
          className={`w-full rounded-lg border border-border bg-surface py-2 text-sm text-foreground
            transition-colors placeholder:text-muted focus-visible:outline-2 focus-visible:outline-ring
            min-h-[44px] sm:min-h-0 ${Icone ? "pl-9 pr-3" : "px-3"} ${erro ? "border-critical" : ""} ${className}`}
          {...rest}
        />
      </div>
      {erro && (
        <p id={erroId} className="text-sm text-critical" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
});
