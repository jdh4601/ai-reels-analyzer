import type { MetricVerdict } from "@/lib/analysis/diagnosis";
import { bandColor } from "@/lib/ui/format";

export function MetricBars({ verdicts }: { verdicts: MetricVerdict[] }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">📊 지표</h3>
      {verdicts.map((v) => (
        <div key={v.key} className="flex items-center gap-2 text-sm">
          <span className="w-24 shrink-0">{v.label}</span>
          <div className={`px-2 py-0.5 rounded border ${bandColor(v.band)}`}>{v.value.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}
