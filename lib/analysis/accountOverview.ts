import type { Reel, AccountSnapshot, AccountProfile } from "@/lib/schemas";
import { sortByDate, latestFollowerDelta } from "@/lib/analysis/followerTrend";

export interface AccountOverview {
  followers: number;
  followerDelta: number | null;
  reachLast7d: number;
  reelCount: number;
  avgEngagementRate: number;
}

// 상단 계정 개요 카드용 집계. 프로필 우선, 없으면 스냅샷/릴스에서 추론.
export function buildAccountOverview(
  reels: Reel[],
  snapshots: AccountSnapshot[],
  profile: AccountProfile | null,
): AccountOverview {
  const sorted = sortByDate(snapshots);
  const latest = sorted[sorted.length - 1] ?? null;

  const followers = profile?.followersCount ?? latest?.followerCount ?? 0;
  const reelCount = profile?.mediaCount ?? reels.length;

  const rates = reels
    .map((r) => r.derived?.engagementRate)
    .filter((v): v is number => typeof v === "number");
  const avgEngagementRate =
    rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;

  return {
    followers,
    followerDelta: latestFollowerDelta(snapshots),
    reachLast7d: latest?.reachLast7d ?? 0,
    reelCount,
    avgEngagementRate,
  };
}
