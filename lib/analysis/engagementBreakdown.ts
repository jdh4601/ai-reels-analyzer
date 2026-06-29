import type { Reel } from "@/lib/schemas";

export type EngagementKey = "shares" | "comments" | "saves" | "likes";

export interface EngagementSlice {
  key: EngagementKey;
  name: string;
  value: number;
  pct: number; // 0~100
}

// 범례·도넛 조각 순서의 단일 출처. 색상도 이 순서·키에 맞춘다.
const ORDER: { key: EngagementKey; name: string }[] = [
  { key: "shares", name: "공유" },
  { key: "comments", name: "댓글" },
  { key: "saves", name: "저장" },
  { key: "likes", name: "좋아요" },
];

export function engagementBreakdown(reels: Reel[]): EngagementSlice[] {
  const totals = reels.reduce(
    (acc, r) => ({
      shares: acc.shares + r.shares,
      comments: acc.comments + r.comments,
      saves: acc.saves + r.saves,
      likes: acc.likes + r.likes,
    }),
    { shares: 0, comments: 0, saves: 0, likes: 0 },
  );
  const sum = totals.shares + totals.comments + totals.saves + totals.likes;

  return ORDER.map(({ key, name }) => ({
    key,
    name,
    value: totals[key],
    pct: sum > 0 ? (totals[key] / sum) * 100 : 0,
  })).filter((s) => s.value > 0);
}
