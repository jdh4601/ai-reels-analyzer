import { flattenInsights, mapMediaToReel } from "@/lib/graph/map";

test("flattenInsights는 Graph 인사이트 배열을 metric→value 맵으로 변환", () => {
  const data = {
    data: [
      { name: "reach", values: [{ value: 9000 }] },
      { name: "likes", values: [{ value: 300 }] },
      { name: "ig_reels_avg_watch_time", values: [{ value: 20000 }] },
    ],
  };
  const m = flattenInsights(data);
  expect(m.reach).toBe(9000);
  expect(m.ig_reels_avg_watch_time).toBe(20000);
});

test("mapMediaToReel은 집계 지표를 Reel로 매핑(평균시청 ms→초)", () => {
  const media = {
    id: "media-1",
    media_type: "VIDEO",
    media_product_type: "REELS",
    caption: "창업 인터뷰",
    timestamp: "2026-06-01T00:00:00+0000",
  };
  const insights = {
    views: 10000, reach: 9000, likes: 300, comments: 12, saved: 40, shares: 170,
    ig_reels_avg_watch_time: 20000,
  };
  const reel = mapMediaToReel(media, insights);
  expect(reel.id).toBe("media-1");
  expect(reel.views).toBe(10000);
  expect(reel.saves).toBe(40); // saved → saves
  expect(reel.avgWatchTimeSec).toBeCloseTo(20, 5); // 20000ms → 20s
  expect(reel.caption).toBe("창업 인터뷰");
  expect(reel.durationSec).toBe(0); // API가 길이를 안 줌
});

test("mapMediaToReel은 누락 지표를 0으로 채운다", () => {
  const media = { id: "m2", media_type: "VIDEO", media_product_type: "REELS", timestamp: "2026-06-02T00:00:00+0000" };
  const reel = mapMediaToReel(media, {});
  expect(reel.views).toBe(0);
  expect(reel.likes).toBe(0);
});
