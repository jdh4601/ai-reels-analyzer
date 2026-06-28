import type { ReactNode } from "react";
import type { Band } from "@/lib/analysis/diagnosis";
import { bandColor } from "@/lib/ui/format";
import { cn } from "./cn";

interface BadgeProps {
  children: ReactNode;
  band?: Band;
  className?: string;
}

export function Badge({ children, band, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        band ? bandColor(band) : "border-border-subtle bg-surface-muted text-neutral-600",
        className,
      )}
    >
      {children}
    </span>
  );
}
