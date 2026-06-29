"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PieChartIcon } from "lucide-react";
import type { Reel } from "@/lib/schemas";
import { Card, CardHeader, CardBody, EmptyState } from "@/components/ui";

interface Props {
  reels: Reel[];
}

const COLORS = {
  likes: "#f43f5e",
  comments: "#f59e0b",
  saves: "#3b82f6",
  shares: "#10b981",
};

const LABELS: Record<string, string> = {
  likes: "좋아요",
  comments: "댓글",
  saves: "저장",
  shares: "공유",
};

export function EngagementPieChart({ reels }: Props) {
  if (reels.length === 0) {
    return (
      <Card>
        <CardHeader title="인게이지먼트 구성" icon={<PieChartIcon size={16} className="text-brand-600" />} />
        <CardBody>
          <EmptyState
            icon={<PieChartIcon size={26} />}
            title="릴스 데이터가 없습니다"
            hint="동기화 후 인게이지먼트 비율을 확인하세요."
          />
        </CardBody>
      </Card>
    );
  }

  const totals = reels.reduce(
    (acc, r) => ({
      likes: acc.likes + r.likes,
      comments: acc.comments + r.comments,
      saves: acc.saves + r.saves,
      shares: acc.shares + r.shares,
    }),
    { likes: 0, comments: 0, saves: 0, shares: 0 },
  );

  const data = Object.entries(totals)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({ name: LABELS[key], key, value }));

  return (
    <Card>
      <CardHeader title="인게이지먼트 구성" icon={<PieChartIcon size={16} className="text-brand-600" />} />
      <CardBody>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={COLORS[entry.key as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, n) => [`${Number(v ?? 0).toLocaleString()}`, n]}
              contentStyle={{ borderRadius: 8, border: "1px solid #e9edf3", fontSize: 12 }}
            />
            <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
