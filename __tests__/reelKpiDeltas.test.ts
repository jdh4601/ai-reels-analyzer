import { reelKpiDeltas } from "@/lib/analysis/reelKpiDeltas";
import type { Reel } from "@/lib/schemas";

function reel(p: Partial<Reel> & { id: string }): Reel {
  return {
    postedAt: "2026-06-01T00:00:00Z", durationSec: 30,
    views: 0, reach: 0, likes: 0, comments: 0, saves: 0, shares: 0, avgWatchTimeSec: 0,
    ...p,
  };
}

test("각 KPI의 평균 대비 변화율(%)을 계산한다", () => {
  const target = reel({ id: "t", views: 1500 });
  const history = [reel({ id: "a", views: 1000 }), reel({ id: "b", views: 1000 })];
  const d = reelKpiDeltas(target, history);
  // 평균 1000 대비 1500 → +50%
  expect(d.views).toBeCloseTo(50, 5);
});

test("평균보다 낮으면 음수", () => {
  const target = reel({ id: "t", likes: 50 });
  const history = [reel({ id: "a", likes: 100 }), reel({ id: "b", likes: 100 })];
  expect(reelKpiDeltas(target, history).likes).toBeCloseTo(-50, 5);
});

test("히스토리가 없으면 null", () => {
  const d = reelKpiDeltas(reel({ id: "t", views: 100 }), []);
  expect(d.views).toBeNull();
  expect(d.reach).toBeNull();
});

test("평균이 0이면 null (0으로 나눔 방지)", () => {
  const d = reelKpiDeltas(reel({ id: "t", views: 100 }), [reel({ id: "a", views: 0 })]);
  expect(d.views).toBeNull();
});
