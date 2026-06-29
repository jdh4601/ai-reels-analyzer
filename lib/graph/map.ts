import type { Reel } from "@/lib/schemas";

// Graph 인사이트 응답 { data: [{ name, values: [{ value }] }] } → { metric: value }
export interface GraphInsightsResponse {
  data?: Array<{ name: string; values?: Array<{ value?: number }> }>;
}

export function flattenInsights(response: GraphInsightsResponse): Record<string, number> {
  const map: Record<string, number> = {};
  for (const item of response.data ?? []) {
    const value = item.values?.[0]?.value;
    if (typeof value === "number") map[item.name] = value;
  }
  return map;
}

export interface GraphMedia {
  id: string;
  media_type?: string;
  media_product_type?: string;
  caption?: string;
  timestamp: string;
  thumbnail_url?: string;
  permalink?: string;
}

// API 집계 지표만 매핑. 영상 길이·3초훅·잔존곡선·유입소스는 API가 안 줘서 비움(스샷 보존 대상).
export function mapMediaToReel(media: GraphMedia, insights: Record<string, number>): Reel {
  const num = (k: string) => insights[k] ?? 0;
  return {
    id: media.id,
    postedAt: media.timestamp,
    durationSec: 0, // API 미제공 — 스샷/수동 입력으로 보완
    views: num("views"),
    reach: num("reach"),
    likes: num("likes"),
    comments: num("comments"),
    saves: num("saved"),
    shares: num("shares"),
    avgWatchTimeSec: num("ig_reels_avg_watch_time") / 1000, // ms → s
    caption: media.caption,
    thumbnailUrl: media.thumbnail_url,
    permalink: media.permalink,
  };
}
