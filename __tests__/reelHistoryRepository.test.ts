import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createJsonReelHistoryRepository } from "@/lib/store/reelHistoryRepository";
import type { ReelMetricSnapshot } from "@/lib/schemas";

function tmpDir() {
  return mkdtempSync(join(tmpdir(), "reelhist-"));
}

function snap(p: Partial<ReelMetricSnapshot> & { reelId: string; date: string }): ReelMetricSnapshot {
  return { views: 0, reach: 0, likes: 0, comments: 0, saves: 0, shares: 0, ...p };
}

test("이력이 없으면 빈 배열", async () => {
  const repo = createJsonReelHistoryRepository(tmpDir());
  expect(await repo.list("a")).toEqual([]);
});

test("add 후 reelId로 조회 (날짜 오름차순)", async () => {
  const repo = createJsonReelHistoryRepository(tmpDir());
  await repo.add(snap({ reelId: "a", date: "2026-06-29", views: 500 }));
  await repo.add(snap({ reelId: "a", date: "2026-06-27", views: 100 }));
  await repo.add(snap({ reelId: "b", date: "2026-06-29", views: 9 }));

  const a = await repo.list("a");
  expect(a.map((s) => s.date)).toEqual(["2026-06-27", "2026-06-29"]);
  expect(a.map((s) => s.views)).toEqual([100, 500]);
  expect(await repo.list("b")).toHaveLength(1);
});

test("같은 reelId+date는 덮어쓴다(중복 누적 방지)", async () => {
  const repo = createJsonReelHistoryRepository(tmpDir());
  await repo.add(snap({ reelId: "a", date: "2026-06-29", views: 100 }));
  await repo.add(snap({ reelId: "a", date: "2026-06-29", views: 250 }));
  const a = await repo.list("a");
  expect(a).toHaveLength(1);
  expect(a[0].views).toBe(250);
});
