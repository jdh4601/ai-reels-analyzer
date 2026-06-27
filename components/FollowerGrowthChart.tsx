"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { AccountSnapshot } from "@/lib/schemas";
import { sortByDate, latestFollowerDelta } from "@/lib/analysis/followerTrend";

export function FollowerGrowthChart({ snapshots }: { snapshots: AccountSnapshot[] }) {
  const sorted = sortByDate(snapshots);
  const delta = latestFollowerDelta(snapshots);
  const latest = sorted[sorted.length - 1];

  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">👥 팔로워 성장 추이</h3>
        {latest && (
          <span className="text-sm text-neutral-700">
            {latest.followerCount.toLocaleString()}명
            {delta !== null && (
              <span className={delta >= 0 ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
                {delta >= 0 ? `▲${delta}` : `▼${Math.abs(delta)}`}
              </span>
            )}
          </span>
        )}
      </div>
      {sorted.length < 2 ? (
        <p className="text-sm text-neutral-400">스냅샷 2건 이상 등록하면 그래프가 표시됩니다</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={sorted}>
            <XAxis dataKey="date" />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip />
            <Line type="monotone" dataKey="followerCount" stroke="#7c3aed" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
