import { detectDrops } from "@/lib/analysis/dropDetection";
import type { RetentionPoint, TranscriptLine } from "@/lib/schemas";

const curve: RetentionPoint[] = [
  { sec: 0, pct: 100 },
  { sec: 3, pct: 60 },   // 훅 구간 급락 (13.3%p/s)
  { sec: 6, pct: 55 },   // 완만 (1.7%p/s)
  { sec: 9, pct: 25 },   // 급락 (10%p/s)
  { sec: 12, pct: 22 },
];

test("임계 초과 급락 구간만 탐지한다", () => {
  const drops = detectDrops(curve);
  // 0->3 (40%p), 6->9 (30%p) 두 구간
  expect(drops).toHaveLength(2);
});

test("dropPct 내림차순 정렬", () => {
  const drops = detectDrops(curve);
  expect(drops[0].dropPct).toBeGreaterThanOrEqual(drops[1].dropPct);
});

test("훅 구간(endSec<=3)은 isHook=true", () => {
  const drops = detectDrops(curve);
  const hook = drops.find((d) => d.startSec === 0);
  expect(hook?.isHook).toBe(true);
});

test("SRT 라인을 겹치는 구간에 매핑한다", () => {
  const transcript: TranscriptLine[] = [
    { startSec: 6, endSec: 9, text: "추상적인 설명이 길어집니다" },
  ];
  const drops = detectDrops(curve, transcript);
  const seg = drops.find((d) => d.startSec === 6);
  expect(seg?.lines[0].text).toBe("추상적인 설명이 길어집니다");
});

test("곡선이 2점 미만이면 빈 배열", () => {
  expect(detectDrops([{ sec: 0, pct: 100 }])).toEqual([]);
});
