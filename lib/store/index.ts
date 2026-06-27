import { join } from "node:path";
import { createJsonReelRepository, type ReelRepository } from "@/lib/store/reelRepository";

let repo: ReelRepository | null = null;

export function getRepository(): ReelRepository {
  if (!repo) repo = createJsonReelRepository(join(process.cwd(), "data"));
  return repo;
}
