import { BarChart3 } from "lucide-react";
import type { MetricVerdict } from "@/lib/analysis/diagnosis";
import { BENCHMARKS } from "@/config/benchmarks";
import { metricBarGeometry } from "@/lib/ui/metricBar";
import { fmtPct } from "@/lib/ui/format";
import { Card, CardHeader, CardBody, Badge } from "@/components/ui";

const BAND_LABEL = { weak: "약점", ok: "보통", strong: "강점" } as const;

export function MetricBars({ verdicts }: { verdicts: MetricVerdict[] }) {
  return (
    <Card>
      <CardHeader title="지표 벤치마크" icon={<BarChart3 size={16} className="text-brand-600" />} />
      <CardBody className="space-y-3.5">
        {verdicts.map((v) => {
          const g = metricBarGeometry(v.value, BENCHMARKS[v.key]);
          return (
            <div key={v.key} title={`벤치마크: <${BENCHMARKS[v.key].weakBelow}% 약점 · >${BENCHMARKS[v.key].strongAbove}% 강점`}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-neutral-700">{v.label}</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold tabular-nums text-neutral-900">{fmtPct(v.value)}</span>
                  <Badge band={v.band}>{BAND_LABEL[v.band]}</Badge>
                </span>
              </div>
              {/* weak | ok | strong 구간 위에 현재값 마커 */}
              <div className="relative h-2.5 w-full overflow-hidden rounded-full">
                <div className="flex h-full w-full">
                  <div style={{ width: `${g.weakPct}%` }} className="bg-band-weak-border" />
                  <div style={{ width: `${g.okPct}%` }} className="bg-band-ok-border" />
                  <div style={{ width: `${g.strongPct}%` }} className="bg-band-strong-border" />
                </div>
                <div
                  style={{ left: `${g.markerPct}%` }}
                  className="absolute top-1/2 h-3.5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-900 shadow"
                />
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
