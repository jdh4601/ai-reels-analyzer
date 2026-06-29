"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Clock } from "lucide-react";
import type { WatchTimeBucket } from "@/lib/schemas";
import { Card, CardHeader, CardBody, EmptyState } from "@/components/ui";

interface Props {
  buckets?: WatchTimeBucket[];
}

export function WatchTimeBucketsChart({ buckets }: Props) {
  if (!buckets || buckets.length === 0) {
    return (
      <Card>
        <CardHeader title="얼마나 오래 보는지" icon={<Clock size={16} className="text-brand-600" />} />
        <CardBody>
          <EmptyState
            icon={<Clock size={26} />}
            title="시청 지속 데이터가 없습니다"
            hint="시청 지속 그래프 스크린샷을 업로드하면 구간별 분포가 표시됩니다."
          />
        </CardBody>
      </Card>
    );
  }

  const longWatch = buckets[buckets.length - 1]?.pct ?? 0;

  return (
    <Card>
      <CardHeader title="얼마나 오래 보는지" icon={<Clock size={16} className="text-brand-600" />} />
      <CardBody>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={buckets} margin={{ top: 6, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip
              formatter={(v) => [`${v}%`, "비중"]}
              labelFormatter={(l) => `${l}`}
              contentStyle={{ borderRadius: 8, border: "1px solid #e9edf3", fontSize: 12 }}
            />
            <Bar dataKey="pct" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-2 text-center text-sm text-neutral-600">
          가장 긴 구간 시청 비중이 <b>{longWatch}%</b>입니다.
        </p>
      </CardBody>
    </Card>
  );
}
