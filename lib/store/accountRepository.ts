import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { AccountSnapshotSchema, type AccountSnapshot } from "@/lib/schemas";
import { sortByDate } from "@/lib/analysis/followerTrend";

export interface AccountRepository {
  list(): Promise<AccountSnapshot[]>;
  add(snapshot: AccountSnapshot): Promise<AccountSnapshot>;
}

export function createJsonAccountRepository(dataDir: string): AccountRepository {
  const file = join(dataDir, "snapshots.json");

  async function readAll(): Promise<AccountSnapshot[]> {
    if (!existsSync(file)) return [];
    const raw = await readFile(file, "utf8");
    if (!raw.trim()) return [];
    return z.array(AccountSnapshotSchema).parse(JSON.parse(raw));
  }

  async function writeAll(snapshots: AccountSnapshot[]): Promise<void> {
    if (!existsSync(dataDir)) await mkdir(dataDir, { recursive: true });
    await writeFile(file, JSON.stringify(snapshots, null, 2), "utf8");
  }

  return {
    async list() {
      return sortByDate(await readAll());
    },
    async add(snapshot) {
      const validated = AccountSnapshotSchema.parse(snapshot);
      const all = await readAll();
      const idx = all.findIndex((s) => s.date === validated.date);
      const next =
        idx === -1 ? [...all, validated] : all.map((s, i) => (i === idx ? validated : s));
      await writeAll(next);
      return validated;
    },
  };
}
