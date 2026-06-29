import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { AccountProfileSchema, type AccountProfile } from "@/lib/schemas";

export interface ProfileRepository {
  get(): Promise<AccountProfile | null>;
  save(profile: AccountProfile): Promise<AccountProfile>;
}

export function createJsonProfileRepository(dataDir: string): ProfileRepository {
  const file = join(dataDir, "profile.json");

  return {
    async get() {
      if (!existsSync(file)) return null;
      const raw = await readFile(file, "utf8");
      if (!raw.trim()) return null;
      return AccountProfileSchema.parse(JSON.parse(raw));
    },
    async save(profile) {
      const validated = AccountProfileSchema.parse(profile);
      if (!existsSync(dataDir)) await mkdir(dataDir, { recursive: true });
      await writeFile(file, JSON.stringify(validated, null, 2), "utf8");
      return validated;
    },
  };
}
