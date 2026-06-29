"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Users, TrendingUp, TrendingDown } from "lucide-react";
import type { AccountSnapshot } from "@/lib/schemas";
import { sortByDate, latestFollowerDelta } from "@/lib/analysis/followerTrend";
import { Card, CardHeader, CardBody, EmptyState } from "@/components/ui";

export function FollowerGrowthChart({ snapshots }: { snapshots: AccountSnapshot[] }) {
  const sorted = sortByDate(snapshots);
  const delta = latestFollowerDelta(snapshots);
  const latest = sorted[sorted.length - 1];

  const action =
    latest != null ? (
      <span className="flex items-center gap-1 text-sm text-neutral-700">
        <span className="font-semibold tabular-nums">{latest.followerCount.toLocaleString()}명</span>
        {delta !== null && delta !== 0 && (
          <span
            className={
              delta > 0
                ? "inline-flex items-center gap-0.5 text-band-strong"
                : "inline-flex items-center gap-0.5 text-band-weak"
            }
          >
            {delta > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(delta)}
          </span>
        )}
      </span>
    ) : undefined;

  return (
    <Card>
      <CardHeader title="팔로워 성장 추이" icon={<Users size={16} className="text-brand-600" />} action={action} />
      <CardBody>
        {sorted.length < 2 ? (
          <EmptyState
            icon={<Users size={26} />}
            title="스냅샷 2건 이상이면 그래프가 표시됩니다"
            hint="동기화하거나 아래 폼에서 팔로워 수를 직접 등록하세요."
          />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={sorted} margin={{ top: 6, right: 8, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="followerFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                formatter={(v) => [`${Number(v).toLocaleString()}명`, "팔로워"]}
                contentStyle={{ borderRadius: 8, border: "1px solid #e9edf3", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="followerCount" stroke="#6366f1" strokeWidth={2} fill="url(#followerFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}
