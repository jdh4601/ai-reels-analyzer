import type { Threshold } from "@/config/benchmarks";
import type { MetricVerdict } from "@/lib/analysis/diagnosis";

export interface MetricBarGeometry {
  axisMax: number;
  weakPct: number; // weak 구간 너비 %
  okPct: number; // ok 구간 너비 %
  strongPct: number; // strong 구간 너비 %
  markerPct: number; // 현재값 위치 % (0~100 클램프)
}

const HEADROOM = 1.6;

// 벤치마크 대비 가로 막대 기하: weak|ok|strong 구간 + 현재값 마커 위치.
export function metricBarGeometry(value: number, t: Threshold): MetricBarGeometry {
  const axisMax = t.strongAbove * HEADROOM;
  const weakPct = (t.weakBelow / axisMax) * 100;
  const strongStart = (t.strongAbove / axisMax) * 100;
  const okPct = strongStart - weakPct;
  const strongPct = 100 - strongStart;
  const markerPct = Math.max(0, Math.min(100, (value / axisMax) * 100));
  return { axisMax, weakPct, okPct, strongPct, markerPct };
}

// verdict가 band를 만든 임계값(threshold)으로 막대를 그린다.
// 라벨(band)과 마커가 항상 같은 자를 쓰게 보장 — MetricBars는 이 함수만 호출할 것.
export function verdictBarGeometry(v: MetricVerdict): MetricBarGeometry {
  return metricBarGeometry(v.value, v.threshold);
}
