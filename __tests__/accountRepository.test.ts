import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createJsonAccountRepository } from "@/lib/store/accountRepository";
import type { AccountSnapshot } from "@/lib/schemas";

function tmpRepo() {
  const dir = mkdtempSync(join(tmpdir(), "snaps-"));
  return createJsonAccountRepository(dir);
}

const snap: AccountSnapshot = { date: "2026-06-01", followerCount: 1000, reachLast7d: 4000 };

test("처음엔 빈 목록", async () => {
  const repo = tmpRepo();
  expect(await repo.list()).toEqual([]);
});

test("add 후 list로 조회되며 날짜순 정렬", async () => {
  const repo = tmpRepo();
  await repo.add({ date: "2026-06-10", followerCount: 1200, reachLast7d: 5000 });
  await repo.add(snap);
  const all = await repo.list();
  expect(all.map((s) => s.date)).toEqual(["2026-06-01", "2026-06-10"]);
});

test("같은 날짜 add는 덮어쓴다 (중복 안 생김)", async () => {
  const repo = tmpRepo();
  await repo.add(snap);
  await repo.add({ ...snap, followerCount: 1050 });
  const all = await repo.list();
  expect(all).toHaveLength(1);
  expect(all[0].followerCount).toBe(1050);
});
