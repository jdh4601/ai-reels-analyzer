"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";
import type { Reel } from "@/lib/schemas";
import { Card, CardHeader, CardBody, EmptyState } from "@/components/ui";

export function GrowthTrend({ reels }: { reels: Reel[] }) {
  const data = reels.map((r, i) => ({ idx: i + 1, hook: r.hookRetention3s ?? 0 }));
  return (
    <Card>
      <CardHeader title="성장 추이 (3초 훅)" icon={<LineChartIcon size={16} className="text-brand-600" />} />
      <CardBody>
        {reels.length < 2 ? (
          <EmptyState
            icon={<LineChartIcon size={26} />}
            title="추이는 릴스 2개 이상부터 표시됩니다"
            hint="동기화하거나 스크린샷을 더 등록해 보세요."
          />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="hookFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="idx" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                formatter={(v) => [`${v}%`, "3초 훅"]}
                labelFormatter={(l) => `${l}번째 릴스`}
                contentStyle={{ borderRadius: 8, border: "1px solid #e9edf3", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="hook" stroke="#16a34a" strokeWidth={2} fill="url(#hookFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}
