import { join } from "node:path";
import { createJsonReelRepository, type ReelRepository } from "@/lib/store/reelRepository";
import { createJsonAccountRepository, type AccountRepository } from "@/lib/store/accountRepository";
import { createJsonProfileRepository, type ProfileRepository } from "@/lib/store/profileRepository";

const dataDir = () => join(process.cwd(), "data");

let repo: ReelRepository | null = null;
let accountRepo: AccountRepository | null = null;
let profileRepo: ProfileRepository | null = null;

export function getRepository(): ReelRepository {
  if (!repo) repo = createJsonReelRepository(dataDir());
  return repo;
}

export function getAccountRepository(): AccountRepository {
  if (!accountRepo) accountRepo = createJsonAccountRepository(dataDir());
  return accountRepo;
}

export function getProfileRepository(): ProfileRepository {
  if (!profileRepo) profileRepo = createJsonProfileRepository(dataDir());
  return profileRepo;
}
