import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { PROVIDER_IDS, PROVIDER_PRESETS, type ProviderId } from "@/lib/llm/providers";
import { maskApiKey } from "@/lib/settings/mask";

const ProviderConfigSchema = z.object({
  apiKey: z.string().optional(),
  model: z.string().optional(),
});

const ProvidersSchema = z.object({
  anthropic: ProviderConfigSchema,
  openai: ProviderConfigSchema,
  kimi: ProviderConfigSchema,
  gemini: ProviderConfigSchema,
});

export const SettingsSchema = z.object({
  activeProvider: z.enum(["anthropic", "openai", "kimi", "gemini"]),
  providers: ProvidersSchema,
});
export type Settings = z.infer<typeof SettingsSchema>;

// 클라이언트가 보내는 부분 업데이트 (apiKey 비우면 기존 유지)
export const SettingsInputSchema = z.object({
  activeProvider: z.enum(["anthropic", "openai", "kimi", "gemini"]).optional(),
  providers: z
    .object({
      anthropic: ProviderConfigSchema.optional(),
      openai: ProviderConfigSchema.optional(),
      kimi: ProviderConfigSchema.optional(),
      gemini: ProviderConfigSchema.optional(),
    })
    .optional(),
});
export type SettingsInput = z.infer<typeof SettingsInputSchema>;

export interface MaskedProvider {
  configured: boolean;
  maskedKey: string | null;
  model: string;
}
export interface MaskedSettings {
  activeProvider: ProviderId;
  providers: Record<ProviderId, MaskedProvider>;
}

function defaultSettings(): Settings {
  return {
    activeProvider: "anthropic",
    providers: { anthropic: {}, openai: {}, kimi: {}, gemini: {} },
  };
}

export interface SettingsStore {
  get(): Promise<Settings>;
  save(incoming: SettingsInput): Promise<Settings>;
  masked(): Promise<MaskedSettings>;
}

export function createSettingsStore(dataDir: string): SettingsStore {
  const file = join(dataDir, "settings.json");

  async function get(): Promise<Settings> {
    if (!existsSync(file)) return defaultSettings();
    const raw = await readFile(file, "utf8");
    if (!raw.trim()) return defaultSettings();
    return SettingsSchema.parse(JSON.parse(raw));
  }

  async function write(settings: Settings): Promise<void> {
    if (!existsSync(dataDir)) await mkdir(dataDir, { recursive: true });
    await writeFile(file, JSON.stringify(settings, null, 2), "utf8");
  }

  async function save(incoming: SettingsInput): Promise<Settings> {
    const cur = await get();
    const next: Settings = {
      activeProvider: incoming.activeProvider ?? cur.activeProvider,
      providers: { ...cur.providers },
    };
    for (const id of PROVIDER_IDS) {
      const inc = incoming.providers?.[id];
      if (!inc) continue;
      const existing = cur.providers[id];
      const trimmedKey = inc.apiKey?.trim();
      next.providers[id] = {
        apiKey: trimmedKey ? trimmedKey : existing.apiKey, // 빈 값이면 기존 유지
        model: inc.model !== undefined ? inc.model : existing.model,
      };
    }
    await write(next);
    return next;
  }

  async function masked(): Promise<MaskedSettings> {
    const s = await get();
    const providers = {} as Record<ProviderId, MaskedProvider>;
    for (const id of PROVIDER_IDS) {
      const c = s.providers[id];
      providers[id] = {
        configured: Boolean(c.apiKey),
        maskedKey: c.apiKey ? maskApiKey(c.apiKey) : null,
        model: c.model ?? PROVIDER_PRESETS[id].defaultModel,
      };
    }
    return { activeProvider: s.activeProvider, providers };
  }

  return { get, save, masked };
}
