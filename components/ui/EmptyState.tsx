import type { ReactNode } from "react";
import { cn } from "./cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  hint?: string;
  className?: string;
}

// 데이터 0/미연결 상태를 깨져 보이지 않게 표현
export function EmptyState({ icon, title, hint, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-border-subtle bg-surface-muted px-6 py-8 text-center",
        className,
      )}
    >
      {icon && <div className="mb-2 text-neutral-300">{icon}</div>}
      <p className="text-sm font-medium text-neutral-600">{title}</p>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}
