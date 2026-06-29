import type { GraphClient } from "@/lib/graph/client";
import type { ReelRepository } from "@/lib/store/reelRepository";
import type { AccountRepository } from "@/lib/store/accountRepository";
import type { ProfileRepository } from "@/lib/store/profileRepository";
import type { ReelHistoryRepository } from "@/lib/store/reelHistoryRepository";
import { mapMediaToReel } from "@/lib/graph/map";
import { computeDerivedRates } from "@/lib/analysis/metrics";
import type { Reel } from "@/lib/schemas";

export interface SyncResult {
  syncedReels: number;
  followerCount: number;
  username: string;
}

// 기존 릴스가 있으면 스크린샷 출처 필드(길이·훅·잔존곡선·유입소스·자막)를 보존하고
// API 집계 수치만 갱신한다.
function mergeWithExisting(mapped: Reel, existing: Reel | null): Reel {
  if (!existing) return mapped;
  const hookFromSkip = existing.hookRetention3s ??
    (existing.skipRate != null ? 100 - existing.skipRate : undefined);
  return {
    ...mapped,
    durationSec: existing.durationSec || mapped.durationSec,
    hookRetention3s: hookFromSkip,
    skipRate: existing.skipRate,
    retentionCurve: existing.retentionCurve,
    reachSources: existing.reachSources,
    audienceBreakdown: existing.audienceBreakdown,
    watchTimeBuckets: existing.watchTimeBuckets,
    followsFromReel: existing.followsFromReel,
    profileVisits: existing.profileVisits,
    transcript: existing.transcript,
    caption: mapped.caption ?? existing.caption,
  };
}

export async function syncFromGraph(
  client: GraphClient,
  reelRepo: ReelRepository,
  accountRepo: AccountRepository,
  today: string,
  profileRepo?: ProfileRepository,
  historyRepo?: ReelHistoryRepository,
): Promise<SyncResult> {
  const profile = await client.getProfile();
  const reels = await client.listReels();

  let synced = 0;
  for (const media of reels) {
    const insights = await client.getInsights(media.id);
    const mapped = mapMediaToReel(media, insights);
    const existing = await reelRepo.get(mapped.id);
    const merged = mergeWithExisting(mapped, existing);
    await reelRepo.upsert({ ...merged, derived: computeDerivedRates(merged) });
    // 동기화 시점의 지표를 이력으로 누적(조회수/도달 추이용)
    if (historyRepo) {
      await historyRepo.add({
        reelId: merged.id,
        date: today,
        views: merged.views,
        reach: merged.reach,
        likes: merged.likes,
        comments: merged.comments,
        saves: merged.saves,
        shares: merged.shares,
      });
    }
    synced++;
  }

  await accountRepo.add({ date: today, followerCount: profile.followersCount, reachLast7d: 0 });
  if (profileRepo) {
    await profileRepo.save({
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      followersCount: profile.followersCount,
      mediaCount: profile.mediaCount,
      updatedAt: today,
    });
  }
  return { syncedReels: synced, followerCount: profile.followersCount, username: profile.username };
}
