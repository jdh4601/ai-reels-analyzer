import { ReelSchema, ScreenshotParseSchema } from "@/lib/schemas";

test("ReelSchema는 필수 집계 지표가 있는 최소 릴스를 통과시킨다", () => {
  const reel = {
    id: "r1", postedAt: "2026-06-01T00:00:00Z", durationSec: 53,
    views: 10000, reach: 9000, likes: 300, comments: 12,
    saves: 40, shares: 170, avgWatchTimeSec: 20,
  };
  expect(() => ReelSchema.parse(reel)).not.toThrow();
});

test("ReelSchema는 음수 views를 거부한다", () => {
  const bad = {
    id: "r1", postedAt: "2026-06-01T00:00:00Z", durationSec: 53,
    views: -1, reach: 9000, likes: 300, comments: 12,
    saves: 40, shares: 170, avgWatchTimeSec: 20,
  };
  expect(() => ReelSchema.parse(bad)).toThrow();
});

test("ScreenshotParseSchema는 잔존곡선 좌표와 3초훅을 검증한다", () => {
  const parsed = {
    hookRetention3s: 35.3,
    retentionCurve: [{ sec: 0, pct: 100 }, { sec: 3, pct: 35.3 }],
    reachSources: { reelsTab: 60, explore: 30, home: 10 },
  };
  expect(() => ScreenshotParseSchema.parse(parsed)).not.toThrow();
});
