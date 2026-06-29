"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Users } from "lucide-react";
import type { AudienceBreakdown } from "@/lib/schemas";
import { Card, CardHeader, CardBody, EmptyState } from "@/components/ui";

interface Props {
  breakdown?: AudienceBreakdown;
}

const COLORS = ["#4f46e5", "#f59e0b"];

export function AudienceBreakdownCard({ breakdown }: Props) {
  if (!breakdown) {
    return (
      <Card>
        <CardHeader title="팔로워 / 논팔로워" icon={<Users size={16} className="text-brand-600" />} />
        <CardBody>
          <EmptyState
            icon={<Users size={26} />}
            title="팔로워 비중 데이터가 없습니다"
            hint="팔로워/논팔로워 스크린샷을 업로드하면 비율이 표시됩니다."
          />
        </CardBody>
      </Card>
    );
  }

  const data = [
    { name: "팔로워", value: breakdown.followersPct },
    { name: "팔로워가 아닌 사람", value: breakdown.nonFollowersPct },
  ];

  return (
    <Card>
      <CardHeader title="팔로워 / 논팔로워" icon={<Users size={16} className="text-brand-600" />} />
      <CardBody>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              label={({ name, value }) => `${name} ${value}%`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [`${v}%`, ""]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Legend verticalAlign="bottom" height={24} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
        <p className="mt-2 text-center text-sm text-neutral-600">
          논팔로워가 <b>{breakdown.nonFollowersPct}%</b>로 도달 확장 {breakdown.nonFollowersPct > 60 ? "중입니다" : "제한적입니다"}.
        </p>
      </CardBody>
    </Card>
  );
}
