import { computeDashboardMetrics } from "@/lib/analysis/dashboardMetrics";
import type { Reel } from "@/lib/schemas";

function reel(p: Partial<Reel> & { id: string }): Reel {
  return {
    postedAt: "2026-06-01T00:00:00+0000",
    durationSec: 0,
    views: 0,
    reach: 0,
    likes: 0,
    comments: 0,
    saves: 0,
    shares: 0,
    avgWatchTimeSec: 0,
    ...p,
  };
}

const reels: Reel[] = [
  reel({
    id: "a",
    postedAt: "2026-06-01T00:00:00+0000",
    durationSec: 30,
    views: 10000,
    reach: 9000,
    avgWatchTimeSec: 22,
    skipRate: 40,
    followsFromReel: 45,
    profileVisits: 180,
  }),
  reel({
    id: "b",
    postedAt: "2026-06-05T00:00:00+0000",
    durationSec: 30,
    views: 5000,
    reach: 4000,
    avgWatchTimeSec: 12,
    skipRate: 65,
    followsFromReel: 20,
    profileVisits: 80,
  }),
];

test("시간순으로 인덱스를 매긴 시리즈를 반환", () => {
  const m = computeDashboardMetrics(reels);
  expect(m.series.map((s) => s.idx)).toEqual([1, 2]);
  expect(m.series[0].completionRate).toBeCloseTo((22 / 30) * 100, 5);
  expect(m.series[1].completionRate).toBeCloseTo((12 / 30) * 100, 5);
});

test("평균 시청 시간과 완시율을 집계", () => {
  const m = computeDashboardMetrics(reels);
  expect(m.avgWatchTimeSec).toBeCloseTo(17, 5);
  expect(m.completionRate).toBeCloseTo(((22 / 30 + 12 / 30) * 100) / 2, 5);
  expect(m.avgDurationSec).toBeCloseTo(30, 5);
});

test("Skip Rate 평균 및 이탈 심한 릴스 탐지", () => {
  const m = computeDashboardMetrics(reels);
  expect(m.skipRate).toBeCloseTo(52.5, 5);
  expect(m.highSkipReels.map((r) => r.idx)).toEqual([2]);
});

test("팔로우 전환율 평균 및 TOP 순위", () => {
  const m = computeDashboardMetrics(reels);
  // a: 45/9000*100=0.5, b: 20/4000*100=0.5
  expect(m.followConversionRate).toBeCloseTo(0.5, 5);
  expect(m.topFollowConversionReels).toHaveLength(2);
});

test("프로필 방문률 평균", () => {
  const m = computeDashboardMetrics(reels);
  // a: 180/9000*100=2, b: 80/4000*100=2
  expect(m.profileVisitRate).toBeCloseTo(2, 5);
});

test("데이터가 비면 null로 안전 처리", () => {
  const m = computeDashboardMetrics([]);
  expect(m.avgWatchTimeSec).toBeNull();
  expect(m.completionRate).toBeNull();
  expect(m.avgDurationSec).toBeNull();
  expect(m.skipRate).toBeNull();
  expect(m.followConversionRate).toBeNull();
  expect(m.profileVisitRate).toBeNull();
  expect(m.series).toHaveLength(0);
});

test("길이 정보 없으면 완시율 집계에서 제외", () => {
  const r = reel({
    id: "c",
    postedAt: "2026-06-10T00:00:00+0000",
    durationSec: 0,
    views: 1000,
    reach: 900,
    avgWatchTimeSec: 10,
  });
  const m = computeDashboardMetrics([reels[0], r]);
  expect(m.completionRate).toBeCloseTo((22 / 30) * 100, 5);
});
