import type { Band } from "@/lib/analysis/diagnosis";

// 진단 밴드 → 디자인 토큰 클래스 (globals.css @theme 정의)
const BAND_CLASSES: Record<Band, string> = {
  weak: "text-band-weak bg-band-weak-soft border-band-weak-border",
  ok: "text-band-ok bg-band-ok-soft border-band-ok-border",
  strong: "text-band-strong bg-band-strong-soft border-band-strong-border",
};

export function bandColor(band: Band): string {
  return BAND_CLASSES[band];
}

export function fmtPct(n: number): string {
  return `${n.toFixed(2)}%`;
}

export function fmtDelta(n: number): string {
  if (n === 0) return "—";
  const arrow = n > 0 ? "▲" : "▼";
  return `${arrow}${Math.abs(n).toFixed(1)}%p`;
}
