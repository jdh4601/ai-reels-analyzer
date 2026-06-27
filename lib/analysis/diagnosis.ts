import { BENCHMARKS, type MetricKey, type Threshold } from "@/config/benchmarks";
import type { Reel } from "@/lib/schemas";
import { computeDerivedRates } from "@/lib/analysis/metrics";

export type Band = "weak" | "ok" | "strong";

export interface MetricVerdict {
  key: MetricKey;
  label: string;
  value: number;
  band: Band;
  priorityScore: number;
}

export interface Diagnosis {
  verdicts: MetricVerdict[];
  strengths: MetricVerdict[];
  weaknesses: MetricVerdict[];
  bottleneck: MetricVerdict | null;
}

export function classifyBand(value: number, t: Threshold): Band {
  if (value < t.weakBelow) return "weak";
  if (value > t.strongAbove) return "strong";
  return "ok";
}

// MetricKey → 해당 릴스의 측정값(없으면 undefined)
function metricValues(reel: Reel): Partial<Record<MetricKey, number>> {
  const d = computeDerivedRates(reel);
  return {
    hookRetention3s: reel.hookRetention3s,
    completionRate: d.completionRate,
    shareRate: d.shareRate,
    saveRate: d.saveRate,
    likeRate: d.likeRate,
    commentRate: d.commentRate,
    followRate: d.followRate,
  };
}

function priorityScore(value: number, t: Threshold): number {
  const gap = Math.max(0, (t.weakBelow - value) / t.weakBelow);
  return t.weight * gap;
}

export function diagnose(
  reel: Reel,
  thresholds: Record<MetricKey, Threshold> = BENCHMARKS,
): Diagnosis {
  const values = metricValues(reel);
  const verdicts: MetricVerdict[] = [];

  for (const key of Object.keys(thresholds) as MetricKey[]) {
    const value = values[key];
    if (value === undefined) continue;
    const t = thresholds[key];
    const band = classifyBand(value, t);
    verdicts.push({
      key,
      label: t.label,
      value,
      band,
      priorityScore: band === "weak" ? priorityScore(value, t) : 0,
    });
  }

  const strengths = verdicts.filter((v) => v.band === "strong");
  const weaknesses = verdicts.filter((v) => v.band === "weak");
  const bottleneck =
    weaknesses.length === 0
      ? null
      : weaknesses.reduce((a, b) => (b.priorityScore > a.priorityScore ? b : a));

  return { verdicts, strengths, weaknesses, bottleneck };
}
