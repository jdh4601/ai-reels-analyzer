import { engagementBreakdown } from "@/lib/analysis/engagementBreakdown";
import type { Reel } from "@/lib/schemas";

function reel(p: Partial<Reel>): Reel {
  return {
    id: "r", postedAt: "2026-06-01T00:00:00Z", durationSec: 30,
    views: 0, reach: 0, likes: 0, comments: 0, saves: 0, shares: 0, avgWatchTimeSec: 0,
    ...p,
  };
}

test("범례·조각 순서를 단일 출처(공유→댓글→저장→좋아요)로 고정한다", () => {
  const b = engagementBreakdown([reel({ likes: 100, comments: 20, saves: 30, shares: 50 })]);
  expect(b.map((s) => s.key)).toEqual(["shares", "comments", "saves", "likes"]);
});

test("각 조각의 pct는 합이 100", () => {
  const b = engagementBreakdown([reel({ likes: 100, comments: 20, saves: 30, shares: 50 })]);
  const sum = b.reduce((a, s) => a + s.pct, 0);
  expect(sum).toBeCloseTo(100, 5);
  const likes = b.find((s) => s.key === "likes");
  expect(likes?.pct).toBeCloseTo((100 / 200) * 100, 5); // 50%
});

test("값이 0인 항목은 제외", () => {
  const b = engagementBreakdown([reel({ likes: 10, comments: 0, saves: 0, shares: 5 })]);
  expect(b.map((s) => s.key)).toEqual(["shares", "likes"]);
});

test("여러 릴스를 합산한다", () => {
  const b = engagementBreakdown([reel({ likes: 10 }), reel({ likes: 20, shares: 10 })]);
  expect(b.find((s) => s.key === "likes")?.value).toBe(30);
  expect(b.find((s) => s.key === "shares")?.value).toBe(10);
});

test("데이터 없으면 빈 배열", () => {
  expect(engagementBreakdown([])).toEqual([]);
});
