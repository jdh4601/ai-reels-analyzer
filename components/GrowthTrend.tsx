"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Reel } from "@/lib/schemas";

export function GrowthTrend({ reels }: { reels: Reel[] }) {
  if (reels.length < 2) {
    return <p className="text-sm text-neutral-400">📈 성장 추이는 릴스 2개 이상부터 표시됩니다</p>;
  }
  const data = reels.map((r, i) => ({ idx: i + 1, hook: r.hookRetention3s ?? 0 }));
  return (
    <div>
      <h3 className="font-semibold mb-2">📈 성장 추이 (3초 훅)</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <XAxis dataKey="idx" />
          <YAxis domain={[0, 100]} unit="%" />
          <Tooltip />
          <Line type="monotone" dataKey="hook" stroke="#16a34a" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
