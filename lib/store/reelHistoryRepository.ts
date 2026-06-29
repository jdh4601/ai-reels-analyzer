import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { ReelMetricSnapshotSchema, type ReelMetricSnapshot } from "@/lib/schemas";

export interface ReelHistoryRepository {
  list(reelId: string): Promise<ReelMetricSnapshot[]>;
  add(snapshot: ReelMetricSnapshot): Promise<ReelMetricSnapshot>;
}

export function createJsonReelHistoryRepository(dataDir: string): ReelHistoryRepository {
  const file = join(dataDir, "reel-history.json");

  async function readAll(): Promise<ReelMetricSnapshot[]> {
    if (!existsSync(file)) return [];
    const raw = await readFile(file, "utf8");
    if (!raw.trim()) return [];
    return z.array(ReelMetricSnapshotSchema).parse(JSON.parse(raw));
  }

  async function writeAll(rows: ReelMetricSnapshot[]): Promise<void> {
    if (!existsSync(dataDir)) await mkdir(dataDir, { recursive: true });
    await writeFile(file, JSON.stringify(rows, null, 2), "utf8");
  }

  return {
    async list(reelId) {
      const all = await readAll();
      return all
        .filter((s) => s.reelId === reelId)
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    async add(snapshot) {
      const validated = ReelMetricSnapshotSchema.parse(snapshot);
      const all = await readAll();
      // 같은 릴스+날짜는 덮어써서 동기화 반복 시 중복 누적을 막는다.
      const idx = all.findIndex((s) => s.reelId === validated.reelId && s.date === validated.date);
      const next = idx === -1 ? [...all, validated] : all.map((s, i) => (i === idx ? validated : s));
      await writeAll(next);
      return validated;
    },
  };
}
