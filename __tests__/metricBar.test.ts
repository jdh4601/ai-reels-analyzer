import { metricBarGeometry } from "@/lib/ui/metricBar";
import type { Threshold } from "@/config/benchmarks";

const t: Threshold = { weakBelow: 45, strongAbove: 55, weight: 5, label: "3초 훅 잔존" };

test("축 최대값은 strongAbove에 헤드룸을 둔다", () => {
  const g = metricBarGeometry(50, t);
  expect(g.axisMax).toBeCloseTo(55 * 1.6, 5);
});

test("구간 너비 합은 100%", () => {
  const g = metricBarGeometry(50, t);
  expect(g.weakPct + g.okPct + g.strongPct).toBeCloseTo(100, 5);
});

test("마커는 값/축최대 비율(%)", () => {
  const g = metricBarGeometry(44, t);
  expect(g.markerPct).toBeCloseTo((44 / (55 * 1.6)) * 100, 5);
});

test("축 최대를 넘는 값은 100%로 클램프", () => {
  const g = metricBarGeometry(999, t);
  expect(g.markerPct).toBe(100);
});

test("음수/0 값은 0%로 클램프", () => {
  const g = metricBarGeometry(0, t);
  expect(g.markerPct).toBe(0);
});
