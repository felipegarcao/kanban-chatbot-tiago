import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variante = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  carregando?: boolean;
}

const CLASSES_VARIANTE: Record<Variante, string> = {
  primary: "bg-accent text-accent-foreground hover:opacity-90",
  secondary: "bg-surface-raised text-foreground border border-border hover:bg-border/40",
  ghost: "text-foreground hover:bg-border/40",
  danger: "bg-critical text-white hover:opacity-90",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variante = "primary", carregando = false, disabled, className = "", children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || carregando}
      aria-busy={carregando}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        min-h-[44px] sm:min-h-0 ${CLASSES_VARIANTE[variante]} ${className}`}
      {...rest}
    >
      {carregando && (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
});
