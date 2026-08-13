import { type InputHTMLAttributes, forwardRef, useId } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  erro?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, erro, id, className = "", ...rest },
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
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(erro)}
        aria-describedby={erroId}
        className={`rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground
          placeholder:text-muted focus-visible:outline-2 focus-visible:outline-ring
          min-h-[44px] sm:min-h-0 ${erro ? "border-critical" : ""} ${className}`}
        {...rest}
      />
      {erro && (
        <p id={erroId} className="text-sm text-critical" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
});
