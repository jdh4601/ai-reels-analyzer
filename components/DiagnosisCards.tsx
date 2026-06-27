import type { MetricVerdict } from "@/lib/analysis/diagnosis";
import { fmtPct } from "@/lib/ui/format";

interface Props {
  strengths: MetricVerdict[];
  weaknesses: MetricVerdict[];
}

function List({ title, items, tone }: { title: string; items: MetricVerdict[]; tone: string }) {
  return (
    <div className={`rounded-lg border p-4 ${tone}`}>
      <h3 className="font-semibold mb-2">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">없음</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((v) => (
            <li key={v.key}>
              {v.label}: {fmtPct(v.value)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DiagnosisCards({ strengths, weaknesses }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <List title="🟢 잘되는 점" items={strengths} tone="bg-green-50 border-green-200" />
      <List title="🔴 당장 개선" items={weaknesses} tone="bg-red-50 border-red-200" />
    </div>
  );
}
