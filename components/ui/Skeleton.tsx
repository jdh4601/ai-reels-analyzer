import { cn } from "./cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neutral-200/70", className)}
      aria-hidden="true"
    />
  );
}
