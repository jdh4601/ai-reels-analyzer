import { BENCHMARKS, BASELINE_MIN_REELS, type MetricKey, type Threshold } from "@/config/benchmarks";
import type { Reel } from "@/lib/schemas";
import { computeDerivedRates } from "@/lib/analysis/metrics";

export function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function valueOf(reel: Reel, key: MetricKey): number | undefined {
  if (key === "hookRetention3s") return reel.hookRetention3s;
  const d = computeDerivedRates(reel);
  return d[key as keyof typeof d];
}

export function buildBaselineThresholds(
  history: Reel[],
): Record<MetricKey, Threshold> | null {
  if (history.length < BASELINE_MIN_REELS) return null;

  const keys = Object.keys(BENCHMARKS) as MetricKey[];
  const result = {} as Record<MetricKey, Threshold>;

  for (const key of keys) {
    const values = history
      .map((r) => valueOf(r, key))
      .filter((v): v is number => v !== undefined);
    const global = BENCHMARKS[key];

    if (values.length < BASELINE_MIN_REELS) {
      result[key] = global; // 이 지표는 데이터 부족 → 글로벌 유지
      continue;
    }
    const m = median(values);
    result[key] = {
      ...global,
      weakBelow: m * 0.85,
      strongAbove: m * 1.15,
    };
  }
  return result;
}

export function deltaVsRecent(
  reel: Reel,
  recent: Reel[],
  key: MetricKey,
): number | null {
  const current = valueOf(reel, key);
  if (current === undefined) return null;

  const recentValues = recent
    .map((r) => valueOf(r, key))
    .filter((v): v is number => v !== undefined);
  if (recentValues.length === 0) return null;

  const avg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  return current - avg;
}
