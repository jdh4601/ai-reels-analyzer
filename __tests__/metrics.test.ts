import { computeDerivedRates } from "@/lib/analysis/metrics";
import type { Reel } from "@/lib/schemas";

const base: Reel = {
  id: "r1", postedAt: "2026-06-01T00:00:00Z", durationSec: 50,
  views: 10000, reach: 9000, likes: 300, comments: 12,
  saves: 40, shares: 170, avgWatchTimeSec: 20,
};

test("공유율 = shares/views*100", () => {
  expect(computeDerivedRates(base).shareRate).toBeCloseTo(1.7, 5);
});

test("완료율 = avgWatchTime/duration*100", () => {
  expect(computeDerivedRates(base).completionRate).toBeCloseTo(40, 5);
});

test("engagementRate = (likes+comments+saves+shares)/views*100", () => {
  expect(computeDerivedRates(base).engagementRate).toBeCloseTo(5.22, 5);
});

test("followsFromReel 있으면 followRate 계산", () => {
  const r = { ...base, followsFromReel: 50 };
  expect(computeDerivedRates(r).followRate).toBeCloseTo(0.5, 5);
});

test("followsFromReel 없으면 followRate undefined", () => {
  expect(computeDerivedRates(base).followRate).toBeUndefined();
});

test("views가 0이면 모든 비율 0 (0 나눗셈 방어)", () => {
  const r = { ...base, views: 0 };
  const d = computeDerivedRates(r);
  expect(d.shareRate).toBe(0);
  expect(d.engagementRate).toBe(0);
});
