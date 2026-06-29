import type { Reel, DerivedRates } from "@/lib/schemas";

function rate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return (numerator / denominator) * 100;
}

export function computeDerivedRates(reel: Reel): DerivedRates {
  const { views, likes, comments, saves, shares, avgWatchTimeSec, durationSec, reach } = reel;
  const engagementCount = likes + comments + saves + shares;

  const derived: DerivedRates = {
    shareRate: rate(shares, views),
    saveRate: rate(saves, views),
    likeRate: rate(likes, views),
    commentRate: rate(comments, views),
    engagementRate: rate(engagementCount, views),
    completionRate: rate(avgWatchTimeSec, durationSec),
  };

  if (reel.followsFromReel !== undefined) {
    derived.followRate = rate(reel.followsFromReel, views);
    derived.followConversionRate = rate(reel.followsFromReel, reach);
  }
  if (reel.profileVisits !== undefined) {
    derived.profileVisitRate = rate(reel.profileVisits, reach);
  }
  return derived;
}
