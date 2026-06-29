import { Compass } from "lucide-react";
import type { ReachSources } from "@/lib/schemas";
import { Card, CardHeader, CardBody } from "@/components/ui";

const LABELS: Record<keyof ReachSources, string> = {
  reelsTab: "릴스 탭",
  explore: "탐색 탭",
  home: "홈",
  profile: "프로필",
  other: "기타",
};

// 유입 소스(릴스 탭/탐색/홈/프로필) 비중을 막대로 표시. 데이터 없으면 렌더 안 함.
export function ReachSourcesCard({ sources }: { sources?: ReachSources }) {
  if (!sources) return null;
  const rows = (Object.keys(LABELS) as (keyof ReachSources)[])
    .map((key) => ({ key, label: LABELS[key], pct: sources[key] }))
    .filter((r): r is { key: keyof ReachSources; label: string; pct: number } => typeof r.pct === "number")
    .sort((a, b) => b.pct - a.pct);

  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader title="유입 소스" icon={<Compass size={16} className="text-brand-600" />} />
      <CardBody className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.key} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-700">{r.label}</span>
              <span className="font-semibold tabular-nums text-neutral-800">{Math.round(r.pct)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, r.pct)}%` }} />
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
