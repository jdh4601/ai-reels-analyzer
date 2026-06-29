import { adjacentReelIds } from "@/lib/analysis/reelNavigation";
import type { Reel } from "@/lib/schemas";

function reel(id: string, postedAt: string): Reel {
  return {
    id, postedAt, durationSec: 30,
    views: 0, reach: 0, likes: 0, comments: 0, saves: 0, shares: 0, avgWatchTimeSec: 0,
  };
}

// 시간순 정렬 후 현재 릴스 기준 이전(더 과거)·다음(더 최신) id를 돌려준다.
const reels = [
  reel("a", "2026-06-01T00:00:00Z"),
  reel("c", "2026-06-03T00:00:00Z"),
  reel("b", "2026-06-02T00:00:00Z"),
];

test("가운데 릴스는 이전·다음이 모두 있다", () => {
  expect(adjacentReelIds(reels, "b")).toEqual({ prevId: "a", nextId: "c" });
});

test("가장 오래된 릴스는 이전이 없다", () => {
  expect(adjacentReelIds(reels, "a")).toEqual({ prevId: null, nextId: "b" });
});

test("가장 최신 릴스는 다음이 없다", () => {
  expect(adjacentReelIds(reels, "c")).toEqual({ prevId: "b", nextId: null });
});

test("목록에 없는 id면 둘 다 null", () => {
  expect(adjacentReelIds(reels, "zzz")).toEqual({ prevId: null, nextId: null });
});
