import { type SelectHTMLAttributes, forwardRef, useId } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, id, className = "", children, ...rest },
  ref,
) {
  const idGerado = useId();
  const selectId = id ?? idGerado;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        className={`min-h-[44px] rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground
          transition-colors focus-visible:outline-2 focus-visible:outline-ring sm:min-h-0 ${className}`}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
});
