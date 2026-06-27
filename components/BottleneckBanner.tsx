import type { MetricVerdict } from "@/lib/analysis/diagnosis";
import { fmtDelta } from "@/lib/ui/format";

interface Props {
  bottleneck: MetricVerdict | null;
  delta: number | null;
}

export function BottleneckBanner({ bottleneck, delta }: Props) {
  if (!bottleneck) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-700">
        ⚡ 뚜렷한 병목이 없습니다 — 잘 하고 있어요.
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
      <p className="font-bold text-red-700">
        ⚡ 이번 병목: {bottleneck.label} {bottleneck.value.toFixed(1)}% — 도달이 여기서 막힙니다
      </p>
      {delta !== null && (
        <p className="text-sm text-neutral-600 mt-1">지난 3개 평균 대비 {fmtDelta(delta)}</p>
      )}
    </div>
  );
}
