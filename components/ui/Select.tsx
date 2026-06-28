import type { SelectHTMLAttributes } from "react";
import { cn } from "./cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-9 rounded-lg border border-border-subtle bg-surface px-3 text-sm text-neutral-900",
        "focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
