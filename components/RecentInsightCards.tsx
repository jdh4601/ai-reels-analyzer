import { ThumbsUp, AlertTriangle, Sparkles } from "lucide-react";
import type { MetricVerdict } from "@/lib/analysis/diagnosis";
import { fmtPct } from "@/lib/ui/format";
import { Card, CardBody } from "@/components/ui";

interface Props {
  strengths: MetricVerdict[];
  weaknesses: MetricVerdict[];
  summary: string;
}

export function RecentInsightCards({ strengths, weaknesses, summary }: Props) {
  return (
    <Card>
      <CardBody>
        <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-800">
          <Sparkles size={15} className="text-brand-600" />
          최근 릴스 진단
        </div>
        <p className="mb-3 text-sm text-neutral-600">{summary}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InsightBox
            title="잘 하고 있어요"
            items={strengths}
            icon={<ThumbsUp size={14} className="text-band-strong" />}
            tone="border-band-strong-border bg-band-strong-soft"
            valueTone="text-band-strong"
            emptyCopy="아직 강점으로 분류된 지표가 없어요."
          />
          <InsightBox
            title="아쉬워요"
            items={weaknesses}
            icon={<AlertTriangle size={14} className="text-band-weak" />}
            tone="border-band-weak-border bg-band-weak-soft"
            valueTone="text-band-weak"
            emptyCopy="약점이 없습니다 — 균형 잡힌 성과예요."
          />
        </div>
      </CardBody>
    </Card>
  );
}

interface BoxProps {
  title: string;
  items: MetricVerdict[];
  icon: React.ReactNode;
  tone: string;
  valueTone: string;
  emptyCopy: string;
}

function InsightBox({ title, items, icon, tone, valueTone, emptyCopy }: BoxProps) {
  return (
    <div className={`rounded-xl border p-3 ${tone}`}>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
        {icon}
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">{emptyCopy}</p>
      ) : (
        <ul className="space-y-1">
          {items.map((v) => (
            <li key={v.key} className="flex items-center justify-between text-sm">
              <span className="text-neutral-700">{v.label}</span>
              <span className={`font-semibold tabular-nums ${valueTone}`}>{fmtPct(v.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
