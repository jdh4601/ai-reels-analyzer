import type { Reel } from "@/lib/schemas";

export type ReelKpiKey =
  | "views"
  | "reach"
  | "likes"
  | "comments"
  | "saves"
  | "shares"
  | "avgWatchTimeSec";

const KEYS: ReelKpiKey[] = [
  "views",
  "reach",
  "likes",
  "comments",
  "saves",
  "shares",
  "avgWatchTimeSec",
];

// 각 KPI의 계정 평균(히스토리) 대비 변화율(%). 비교 불가 시 null.
export type ReelKpiDeltas = Record<ReelKpiKey, number | null>;

export function reelKpiDeltas(reel: Reel, history: Reel[]): ReelKpiDeltas {
  const result = {} as ReelKpiDeltas;

  for (const key of KEYS) {
    if (history.length === 0) {
      result[key] = null;
      continue;
    }
    const avg = history.reduce((sum, r) => sum + r[key], 0) / history.length;
    result[key] = avg === 0 ? null : ((reel[key] - avg) / avg) * 100;
  }

  return result;
}
