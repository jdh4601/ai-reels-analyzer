import { classifyBand, diagnose } from "@/lib/analysis/diagnosis";
import { BENCHMARKS } from "@/config/benchmarks";
import type { Reel } from "@/lib/schemas";

test("classifyBand: 경계값", () => {
  expect(classifyBand(44, BENCHMARKS.hookRetention3s)).toBe("weak");
  expect(classifyBand(50, BENCHMARKS.hookRetention3s)).toBe("ok");
  expect(classifyBand(60, BENCHMARKS.hookRetention3s)).toBe("strong");
});

// 훅 35%(약점, weight5), 공유율 1.7%(강점), 나머지 보통/약점 섞임
const reel: Reel = {
  id: "r1", postedAt: "2026-06-01T00:00:00Z", durationSec: 50,
  views: 10000, reach: 9000, likes: 300, comments: 5,
  saves: 20, shares: 170, avgWatchTimeSec: 20,
  hookRetention3s: 35,
};

test("강점에 공유율, 약점에 3초훅이 포함된다", () => {
  const d = diagnose(reel);
  expect(d.strengths.map((v) => v.key)).toContain("shareRate");
  expect(d.weaknesses.map((v) => v.key)).toContain("hookRetention3s");
});

test("병목은 가중치×갭이 최대인 약점 — 여기선 3초훅(weight5)", () => {
  const d = diagnose(reel);
  expect(d.bottleneck?.key).toBe("hookRetention3s");
});

test("hookRetention3s 미입력 시 verdict에서 제외", () => {
  const noHook = { ...reel, hookRetention3s: undefined };
  const d = diagnose(noHook);
  expect(d.verdicts.map((v) => v.key)).not.toContain("hookRetention3s");
});
