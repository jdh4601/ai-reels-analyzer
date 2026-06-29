import { diagnoseRecent, RECENT_REEL_COUNT } from "@/lib/analysis/recentDiagnosis";
import { buildBaselineThresholds } from "@/lib/analysis/baseline";
import { BENCHMARKS } from "@/config/benchmarks";
import type { Reel } from "@/lib/schemas";

function reel(
  id: string,
  postedAt: string,
  overrides: Partial<Reel> = {},
): Reel {
  return {
    id,
    postedAt,
    durationSec: 50,
    views: 10000,
    reach: 9000,
    likes: 300,
    comments: 5,
    saves: 20,
    shares: 170,
    avgWatchTimeSec: 20,
    hookRetention3s: 50,
    ...overrides,
  };
}

test("최근 릴스만 집계한다", () => {
  const reels = [
    reel("old", "2026-01-01T00:00:00Z", { hookRetention3s: 30 }),
    reel("new1", "2026-06-01T00:00:00Z", { hookRetention3s: 60 }),
    reel("new2", "2026-06-02T00:00:00Z", { hookRetention3s: 60 }),
  ];
  const d = diagnoseRecent(reels);
  expect(d.reelCount).toBe(Math.min(reels.length, RECENT_REEL_COUNT));
  // 전체 평균 (30+60+60)/3 = 50 → ok, 최근 2개만 본다면 strong
  const withoutOld = diagnoseRecent(reels.slice(1));
  expect(withoutOld.strengths.map((v) => v.key)).toContain("hookRetention3s");
});

test("평균이 벤치마크보다 낮으면 약점으로 분류", () => {
  const reels = [
    reel("a", "2026-06-01T00:00:00Z", { hookRetention3s: 30, shares: 10, views: 10000 }),
    reel("b", "2026-06-02T00:00:00Z", { hookRetention3s: 35, shares: 10, views: 10000 }),
  ];
  const d = diagnoseRecent(reels);
  expect(d.weaknesses.map((v) => v.key)).toContain("hookRetention3s");
  expect(d.weaknesses.map((v) => v.key)).toContain("shareRate");
});

test("데이터가 없으면 빈 결과를 반환", () => {
  const d = diagnoseRecent([]);
  expect(d.verdicts).toHaveLength(0);
  expect(d.strengths).toHaveLength(0);
  expect(d.weaknesses).toHaveLength(0);
  expect(d.summary).toContain("데이터가 부족");
});

test("3초 훅 데이터가 없으면 verdict에서 제외", () => {
  const reels = [reel("a", "2026-06-01T00:00:00Z", { hookRetention3s: undefined })];
  const d = diagnoseRecent(reels);
  expect(d.verdicts.map((v) => v.key)).not.toContain("hookRetention3s");
});

// A안: 메인도 상세와 동일한 베이스라인 임계값을 쓴다 (히스토리 ≥5개)
test("히스토리 5개 이상이면 베이스라인 임계값으로 진단한다", () => {
  const reels = Array.from({ length: 6 }, (_, i) =>
    reel(`r${i}`, `2026-06-0${i + 1}T00:00:00Z`, { hookRetention3s: 50 + i }),
  );
  const baseline = buildBaselineThresholds(reels)!;
  const d = diagnoseRecent(reels);
  const hook = d.verdicts.find((v) => v.key === "hookRetention3s");
  expect(hook?.threshold).toEqual(baseline.hookRetention3s);
});

test("히스토리 5개 미만이면 글로벌 벤치마크로 fallback", () => {
  const reels = [
    reel("a", "2026-06-01T00:00:00Z"),
    reel("b", "2026-06-02T00:00:00Z"),
  ];
  const d = diagnoseRecent(reels);
  const hook = d.verdicts.find((v) => v.key === "hookRetention3s");
  expect(hook?.threshold).toEqual(BENCHMARKS.hookRetention3s);
});
