import { buildPlaybook } from "@/lib/recommend/playbook";
import { diagnose } from "@/lib/analysis/diagnosis";
import type { Reel } from "@/lib/schemas";

const weakHook: Reel = {
  id: "r1", postedAt: "2026-06-01T00:00:00Z", durationSec: 50,
  views: 10000, reach: 9000, likes: 300, comments: 5,
  saves: 20, shares: 30, avgWatchTimeSec: 20, hookRetention3s: 35,
};

test("훅 약점이면 콜드오픈 처방을 만든다", () => {
  const recs = buildPlaybook(diagnose(weakHook));
  const hookRec = recs.find((r) => r.metric === "hookRetention3s");
  expect(hookRec).toBeDefined();
  expect(hookRec!.action).toMatch(/콜드 오픈|2~3초/);
});

test("병목 처방은 severity high", () => {
  const recs = buildPlaybook(diagnose(weakHook));
  const hookRec = recs.find((r) => r.metric === "hookRetention3s");
  expect(hookRec!.severity).toBe("high");
});

test("급락 구간이 있으면 컷편집 처방 추가", () => {
  const recs = buildPlaybook(diagnose(weakHook), [
    { startSec: 8, endSec: 10, dropPct: 22, isHook: false, lines: [] },
  ]);
  expect(recs.some((r) => r.metric === "dropSegment")).toBe(true);
});

test("약점이 없으면 빈 배열(급락도 없을 때)", () => {
  const strong: Reel = { ...weakHook, hookRetention3s: 70, shares: 200, comments: 50, saves: 100 };
  expect(buildPlaybook(diagnose(strong))).toEqual([]);
});
