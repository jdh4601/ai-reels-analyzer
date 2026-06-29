import { flattenInsights, type GraphMedia, type GraphInsightsResponse } from "@/lib/graph/map";

const DEFAULT_BASE = "https://graph.instagram.com";
const VERSION = "v23.0";

// 릴스 인사이트 지표 (Instagram Login API)
const REEL_METRICS = [
  "views",
  "reach",
  "likes",
  "comments",
  "saved",
  "shares",
  "total_interactions",
  "ig_reels_avg_watch_time",
].join(",");

export interface GraphProfile {
  userId: string;
  username: string;
  followersCount: number;
  avatarUrl?: string;
  mediaCount: number;
}

interface FetchResult {
  ok: boolean;
  json(): Promise<unknown>;
  text(): Promise<string>;
}
type FetchLike = (url: string) => Promise<FetchResult>;

interface Options {
  accessToken: string;
  baseURL?: string;
  fetchImpl?: FetchLike;
}

export interface GraphClient {
  getProfile(): Promise<GraphProfile>;
  listReels(): Promise<GraphMedia[]>;
  getInsights(mediaId: string): Promise<Record<string, number>>;
}

export function createGraphClient(opts: Options): GraphClient {
  const base = opts.baseURL ?? DEFAULT_BASE;
  const fetchImpl: FetchLike = opts.fetchImpl ?? ((url) => fetch(url) as unknown as Promise<FetchResult>);

  async function request(path: string, params: Record<string, string>): Promise<unknown> {
    const query = new URLSearchParams({ ...params, access_token: opts.accessToken });
    const url = `${base}/${VERSION}/${path}?${query.toString()}`;
    const res = await fetchImpl(url);
    const json: unknown = await res.json();
    if (!res.ok) {
      const message =
        (json as { error?: { message?: string } })?.error?.message ?? `Graph API 오류 (${path})`;
      throw new Error(message);
    }
    return json;
  }

  return {
    async getProfile() {
      const json = (await request("me", {
        fields: "user_id,username,followers_count,profile_picture_url,media_count",
      })) as {
        user_id: string;
        username: string;
        followers_count?: number;
        profile_picture_url?: string;
        media_count?: number;
      };
      return {
        userId: json.user_id,
        username: json.username,
        followersCount: json.followers_count ?? 0,
        avatarUrl: json.profile_picture_url,
        mediaCount: json.media_count ?? 0,
      };
    },

    async listReels() {
      const json = (await request("me/media", {
        fields: "id,media_type,media_product_type,caption,timestamp,thumbnail_url,permalink",
      })) as { data?: GraphMedia[] };
      return (json.data ?? []).filter((m) => m.media_product_type === "REELS");
    },

    async getInsights(mediaId) {
      const json = (await request(`${mediaId}/insights`, { metric: REEL_METRICS })) as GraphInsightsResponse;
      return flattenInsights(json);
    },
  };
}
