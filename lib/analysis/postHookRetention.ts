import type { Reel } from "@/lib/schemas";

// 3초 이후 잔존률: 3초를 넘긴 시청자 중 끝까지 남은 비율.
// 우선순위:
// 1. skipRate가 있으면: 100 - skipRate
// 2. watchTimeBuckets가 있으면: 첫 구간(0~3초)을 제외한 나머지 구간 합계
// 3. retentionCurve가 있으면: (마지막 잔존율 / 3초 잔존율) * 100
// 높을수록 좋음 (3초 이후 이탈이 적다는 의미).
export function postHookRetention(reel: Reel): number | null {
  if (reel.skipRate !== undefined) {
    return Math.max(0, Math.min(100, 100 - reel.skipRate));
  }

  if (reel.watchTimeBuckets && reel.watchTimeBuckets.length > 1) {
    const post3s = reel.watchTimeBuckets.slice(1).reduce((sum, b) => sum + b.pct, 0);
    return Math.max(0, Math.min(100, post3s));
  }

  const hook = reel.hookRetention3s;
  if (hook !== undefined && hook > 0 && reel.retentionCurve && reel.retentionCurve.length > 0) {
    const last = reel.retentionCurve[reel.retentionCurve.length - 1];
    return Math.max(0, Math.min(100, (last.pct / hook) * 100));
  }

  return null;
}

export function averagePostHookRetention(reels: Reel[]): number | null {
  const values = reels.map(postHookRetention).filter((v): v is number => typeof v === "number");
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
