import { join } from "node:path";
import { createSettingsStore, type SettingsStore } from "@/lib/settings/store";

let store: SettingsStore | null = null;

export function getSettingsStore(): SettingsStore {
  if (!store) store = createSettingsStore(join(process.cwd(), "data"));
  return store;
}
