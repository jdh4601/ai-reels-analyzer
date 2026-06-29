import { metricBarGeometry, verdictBarGeometry } from "@/lib/ui/metricBar";
import type { MetricVerdict } from "@/lib/analysis/diagnosis";
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

// verdictBarGeometry: 마커는 verdict.threshold(라벨을 만든 그 자)로 그려져야 한다.
// 라벨은 베이스라인, 마커는 글로벌을 쓰던 불일치 버그를 막는 불변식.
function verdict(value: number, th: Threshold, band: MetricVerdict["band"]): MetricVerdict {
  return { key: "saveRate", label: "저장율", value, band, priorityScore: 0, threshold: th };
}

test("강점 verdict의 마커는 strong 구간에 위치한다", () => {
  const th: Threshold = { weakBelow: 0.1, strongAbove: 0.18, weight: 3, label: "저장율" };
  const g = verdictBarGeometry(verdict(0.33, th, "strong"));
  const strongStart = g.weakPct + g.okPct;
  expect(g.markerPct).toBeGreaterThanOrEqual(strongStart);
});

test("약점 verdict의 마커는 weak 구간에 위치한다", () => {
  const th: Threshold = { weakBelow: 0.5, strongAbove: 0.9, weight: 3, label: "저장율" };
  const g = verdictBarGeometry(verdict(0.2, th, "weak"));
  expect(g.markerPct).toBeLessThanOrEqual(g.weakPct);
});

test("보통 verdict의 마커는 ok 구간에 위치한다", () => {
  const th: Threshold = { weakBelow: 0.3, strongAbove: 0.6, weight: 3, label: "저장율" };
  const g = verdictBarGeometry(verdict(0.45, th, "ok"));
  expect(g.markerPct).toBeGreaterThanOrEqual(g.weakPct);
  expect(g.markerPct).toBeLessThanOrEqual(g.weakPct + g.okPct);
});
