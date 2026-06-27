import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createJsonReelRepository } from "@/lib/store/reelRepository";
import type { Reel } from "@/lib/schemas";

function tmpRepo() {
  const dir = mkdtempSync(join(tmpdir(), "reels-"));
  return createJsonReelRepository(dir);
}

const reel: Reel = {
  id: "r1", postedAt: "2026-06-01T00:00:00Z", durationSec: 50,
  views: 10000, reach: 9000, likes: 300, comments: 12,
  saves: 40, shares: 170, avgWatchTimeSec: 20,
};

test("처음엔 빈 목록", async () => {
  const repo = tmpRepo();
  expect(await repo.list()).toEqual([]);
});

test("upsert 후 get으로 조회된다", async () => {
  const repo = tmpRepo();
  await repo.upsert(reel);
  expect(await repo.get("r1")).toMatchObject({ id: "r1", views: 10000 });
});

test("같은 id upsert는 덮어쓴다 (중복 안 생김)", async () => {
  const repo = tmpRepo();
  await repo.upsert(reel);
  await repo.upsert({ ...reel, views: 20000 });
  const all = await repo.list();
  expect(all).toHaveLength(1);
  expect(all[0].views).toBe(20000);
});
