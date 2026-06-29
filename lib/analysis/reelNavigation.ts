import type { Reel } from "@/lib/schemas";

export interface AdjacentReels {
  prevId: string | null; // 더 과거 릴스
  nextId: string | null; // 더 최신 릴스
}

// 시간순(오름차순) 정렬 후 현재 릴스의 앞·뒤 id를 돌려준다.
export function adjacentReelIds(reels: Reel[], currentId: string): AdjacentReels {
  const sorted = [...reels].sort((a, b) => a.postedAt.localeCompare(b.postedAt));
  const idx = sorted.findIndex((r) => r.id === currentId);
  if (idx === -1) return { prevId: null, nextId: null };
  return {
    prevId: idx > 0 ? sorted[idx - 1].id : null,
    nextId: idx < sorted.length - 1 ? sorted[idx + 1].id : null,
  };
}
