import { Zap, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";
import type { MetricVerdict } from "@/lib/analysis/diagnosis";
import { fmtPct } from "@/lib/ui/format";

interface Props {
  bottleneck: MetricVerdict | null;
  delta: number | null;
}

export function BottleneckBanner({ bottleneck, delta }: Props) {
  if (!bottleneck) {
    return (
      <div className="flex items-center gap-3 rounded-card border border-band-strong-border bg-band-strong-soft p-4">
        <CheckCircle2 className="shrink-0 text-band-strong" size={22} />
        <p className="font-medium text-band-strong">뚜렷한 병목이 없습니다 — 잘 하고 있어요.</p>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 rounded-card border border-band-weak-border bg-band-weak-soft p-4">
      <Zap className="mt-0.5 shrink-0 text-band-weak" size={22} />
      <div>
        <p className="font-semibold text-band-weak">
          이번 병목: {bottleneck.label} {fmtPct(bottleneck.value)} — 도달이 여기서 막힙니다
        </p>
        {delta !== null && delta !== 0 && (
          <p className="mt-1 flex items-center gap-1 text-sm text-neutral-600">
            지난 3개 평균 대비
            <span
              className={
                delta > 0
                  ? "inline-flex items-center gap-0.5 text-band-strong"
                  : "inline-flex items-center gap-0.5 text-band-weak"
              }
            >
              {delta > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(delta).toFixed(1)}%p
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
