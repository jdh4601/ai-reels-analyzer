import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createJsonProfileRepository } from "@/lib/store/profileRepository";

function tmpDir() {
  return mkdtempSync(join(tmpdir(), "profile-"));
}

test("프로필이 없으면 null 반환", async () => {
  const repo = createJsonProfileRepository(tmpDir());
  expect(await repo.get()).toBeNull();
});

test("save 후 get으로 프로필 조회", async () => {
  const repo = createJsonProfileRepository(tmpDir());
  const saved = await repo.save({
    username: "founder",
    avatarUrl: "https://cdn/a.jpg",
    followersCount: 238,
    mediaCount: 12,
    updatedAt: "2026-06-29",
  });
  expect(saved.username).toBe("founder");
  const got = await repo.get();
  expect(got?.followersCount).toBe(238);
  expect(got?.mediaCount).toBe(12);
});
