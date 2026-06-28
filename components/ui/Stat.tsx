import type { ReactNode } from "react";
import { cn } from "./cn";
import { Card } from "./Card";

interface StatProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  className?: string;
}

// 수치 카드: 라벨 + 큰 값 + 보조 힌트(증감 배지 등)
export function Stat({ label, value, icon, hint, className }: StatProps) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">{label}</span>
        {icon && <span className="text-neutral-400">{icon}</span>}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-neutral-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-neutral-500">{hint}</div>}
    </Card>
  );
}
