import { ThumbsUp, AlertTriangle } from "lucide-react";
import type { MetricVerdict } from "@/lib/analysis/diagnosis";
import { fmtPct } from "@/lib/ui/format";

interface Props {
  strengths: MetricVerdict[];
  weaknesses: MetricVerdict[];
}

interface ListProps {
  title: string;
  items: MetricVerdict[];
  icon: React.ReactNode;
  tone: string;
  valueTone: string;
  emptyCopy: string;
}

function List({ title, items, icon, tone, valueTone, emptyCopy }: ListProps) {
  return (
    <div className={`rounded-card border p-4 ${tone}`}>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
        {icon}
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">{emptyCopy}</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {items.map((v) => (
            <li key={v.key} className="flex items-center justify-between">
              <span className="text-neutral-700">{v.label}</span>
              <span className={`font-semibold tabular-nums ${valueTone}`}>{fmtPct(v.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DiagnosisCards({ strengths, weaknesses }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <List
        title="잘되는 점"
        items={strengths}
        icon={<ThumbsUp size={15} className="text-band-strong" />}
        tone="border-band-strong-border bg-band-strong-soft"
        valueTone="text-band-strong"
        emptyCopy="아직 강점으로 분류된 지표가 없어요. 훅·공유를 먼저 끌어올려 보세요."
      />
      <List
        title="당장 개선"
        items={weaknesses}
        icon={<AlertTriangle size={15} className="text-band-weak" />}
        tone="border-band-weak-border bg-band-weak-soft"
        valueTone="text-band-weak"
        emptyCopy="약점이 없습니다 — 균형 잡힌 릴스예요."
      />
    </div>
  );
}
