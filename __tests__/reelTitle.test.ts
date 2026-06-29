import { reelTitle } from "@/lib/ui/reelTitle";
import type { Reel } from "@/lib/schemas";

function reel(partial: Partial<Reel>): Reel {
  return {
    id: "r1",
    postedAt: "2026-06-01T00:00:00+0000",
    durationSec: 0,
    views: 0,
    reach: 0,
    likes: 0,
    comments: 0,
    saves: 0,
    shares: 0,
    avgWatchTimeSec: 0,
    ...partial,
  };
}

test("caption 첫 줄을 제목으로 사용", () => {
  expect(reelTitle(reel({ caption: "창업 3번 망하고 배운 것\n#창업 #인터뷰" }))).toBe(
    "창업 3번 망하고 배운 것",
  );
});

test("앞뒤 공백/빈 줄은 무시하고 첫 의미 있는 줄 사용", () => {
  expect(reelTitle(reel({ caption: "\n\n  투자자가 싫어하는 말  \n다음 줄" }))).toBe(
    "투자자가 싫어하는 말",
  );
});

test("긴 첫 줄은 말줄임", () => {
  const long = "가".repeat(80);
  const title = reelTitle(reel({ caption: long }));
  expect(title.endsWith("…")).toBe(true);
  expect(title.length).toBeLessThanOrEqual(61);
});

test("caption 없으면 날짜 기반 라벨", () => {
  expect(reelTitle(reel({ caption: undefined }))).toBe("릴스 · 2026-06-01");
});

test("caption이 공백뿐이면 날짜 기반 라벨", () => {
  expect(reelTitle(reel({ caption: "   \n  " }))).toBe("릴스 · 2026-06-01");
});
