"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";
import type { Reel } from "@/lib/schemas";
import { postHookRetention } from "@/lib/analysis/postHookRetention";
import { Card, CardHeader, CardBody, EmptyState } from "@/components/ui";

export function GrowthTrend({ reels }: { reels: Reel[] }) {
  const data = reels
    .map((r, i) => ({ idx: i + 1, postHook: postHookRetention(r) ?? 0 }))
    .filter((d) => d.postHook > 0);

  const hasData = data.length > 0;

  return (
    <Card>
      <CardHeader title="3초 이후 잔존률 추이" icon={<LineChartIcon size={16} className="text-brand-600" />} />
      <CardBody>
        {!hasData ? (
          <EmptyState
            icon={<LineChartIcon size={26} />}
            title="3초 이후 잔존률 데이터가 없습니다"
            hint="EDIT 인사이트 스크린샷(3초 훅 + 잔존 곡선)을 업로드하면 추이가 표시됩니다."
          />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="postHookFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="idx" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                formatter={(v) => [`${v}%`, "3초 이후 잔존"]}
                labelFormatter={(l) => `${l}번째 릴스`}
                contentStyle={{ borderRadius: 8, border: "1px solid #e9edf3", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="postHook" stroke="#4f46e5" strokeWidth={2} fill="url(#postHookFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}
