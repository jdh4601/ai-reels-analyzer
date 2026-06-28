import { createGraphClient } from "@/lib/graph/client";

// URL 패턴별로 가짜 응답을 돌려주는 fetch 목
function fakeFetch(routes: Record<string, unknown>) {
  return async (url: string) => {
    const key = Object.keys(routes).find((k) => url.includes(k));
    if (!key) throw new Error("unexpected url: " + url);
    return {
      ok: true,
      json: async () => routes[key],
      text: async () => JSON.stringify(routes[key]),
    };
  };
}

test("getProfile은 user_id/username/followers_count를 반환", async () => {
  const client = createGraphClient({
    accessToken: "tok",
    fetchImpl: fakeFetch({
      "/me?": { user_id: "123", username: "founder", followers_count: 1234 },
    }) as unknown as typeof fetch,
  });
  const p = await client.getProfile();
  expect(p.userId).toBe("123");
  expect(p.followersCount).toBe(1234);
});

test("listReels는 REELS 타입만 반환", async () => {
  const client = createGraphClient({
    accessToken: "tok",
    fetchImpl: fakeFetch({
      "/me/media": {
        data: [
          { id: "a", media_product_type: "REELS", timestamp: "2026-06-01T00:00:00+0000" },
          { id: "b", media_product_type: "FEED", timestamp: "2026-06-02T00:00:00+0000" },
        ],
      },
    }) as unknown as typeof fetch,
  });
  const reels = await client.listReels();
  expect(reels.map((m) => m.id)).toEqual(["a"]);
});

test("getInsights는 토큰을 URL에 포함하고 flatten된 맵을 반환", async () => {
  let seenUrl = "";
  const client = createGraphClient({
    accessToken: "secret-tok",
    fetchImpl: (async (url: string) => {
      seenUrl = url;
      return {
        ok: true,
        json: async () => ({ data: [{ name: "views", values: [{ value: 5000 }] }] }),
        text: async () => "",
      };
    }) as unknown as typeof fetch,
  });
  const insights = await client.getInsights("media-1");
  expect(insights.views).toBe(5000);
  expect(seenUrl).toContain("media-1/insights");
  expect(seenUrl).toContain("access_token=secret-tok");
});

test("API 오류(ok=false)면 throw", async () => {
  const client = createGraphClient({
    accessToken: "tok",
    fetchImpl: (async () => ({
      ok: false,
      json: async () => ({ error: { message: "Invalid OAuth access token" } }),
      text: async () => '{"error":{"message":"Invalid OAuth access token"}}',
    })) as unknown as typeof fetch,
  });
  await expect(client.getProfile()).rejects.toThrow(/Invalid OAuth/);
});
