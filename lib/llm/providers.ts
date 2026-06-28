export type ProviderId = "anthropic" | "openai" | "kimi" | "gemini";

export const PROVIDER_IDS: ProviderId[] = ["anthropic", "openai", "kimi", "gemini"];

export interface ProviderPreset {
  label: string;
  defaultModel: string;
  baseURL: string | null; // null = 네이티브 SDK(Anthropic), 그 외 = OpenAI 호환 baseURL
  vision: boolean;
}

// 제공자별 기본값. 모델명은 UI에서 편집 가능(여기는 합리적 기본값).
export const PROVIDER_PRESETS: Record<ProviderId, ProviderPreset> = {
  anthropic: {
    label: "Anthropic (Claude)",
    defaultModel: "claude-opus-4-8",
    baseURL: null,
    vision: true,
  },
  openai: {
    label: "OpenAI",
    defaultModel: "gpt-4o",
    baseURL: "https://api.openai.com/v1",
    vision: true,
  },
  kimi: {
    label: "Kimi (Moonshot)",
    defaultModel: "moonshot-v1-8k-vision-preview",
    baseURL: "https://api.moonshot.ai/v1",
    vision: true,
  },
  gemini: {
    label: "Google Gemini",
    defaultModel: "gemini-2.0-flash",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    vision: true,
  },
};
