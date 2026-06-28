import type { ReactNode } from "react";
import { cn } from "./cn";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-border-subtle bg-surface shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, icon, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-2 px-4 pt-4", className)}>
      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
        {icon}
        {title}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children, className }: CardProps) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
