import type { Reel } from "@/lib/schemas";
import { reelTitle } from "@/lib/ui/reelTitle";

export type ReelSort = "latest" | "views" | "hook";

export const SORT_LABELS: Record<ReelSort, string> = {
  latest: "최신순",
  views: "조회수순",
  hook: "훅순",
};

function matches(reel: Reel, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const haystack = `${reelTitle(reel)} ${reel.caption ?? ""}`.toLowerCase();
  return haystack.includes(q);
}

function compare(a: Reel, b: Reel, sort: ReelSort): number {
  if (sort === "views") return b.views - a.views;
  if (sort === "hook") {
    // 훅 없는 릴스는 항상 뒤로
    const av = a.hookRetention3s ?? -1;
    const bv = b.hookRetention3s ?? -1;
    return bv - av;
  }
  return b.postedAt.localeCompare(a.postedAt); // latest
}

// 검색(제목·캡션) + 정렬. 순수 — 원본 불변.
export function selectReels(reels: Reel[], query: string, sort: ReelSort): Reel[] {
  return reels.filter((r) => matches(r, query)).sort((a, b) => compare(a, b, sort));
}
