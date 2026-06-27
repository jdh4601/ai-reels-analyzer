import type { Band } from "@/lib/analysis/diagnosis";

export function bandColor(band: Band): string {
  if (band === "weak") return "text-red-600 bg-red-50 border-red-200";
  if (band === "strong") return "text-green-600 bg-green-50 border-green-200";
  return "text-amber-600 bg-amber-50 border-amber-200";
}

export function fmtPct(n: number): string {
  return `${n.toFixed(2)}%`;
}

export function fmtDelta(n: number): string {
  if (n === 0) return "—";
  const arrow = n > 0 ? "▲" : "▼";
  return `${arrow}${Math.abs(n).toFixed(1)}%p`;
}
