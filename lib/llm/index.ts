import { getSettingsStore } from "@/lib/settings";
import { PROVIDER_PRESETS } from "@/lib/llm/providers";
import { createAnthropicVisionModel } from "@/lib/llm/anthropic";
import { createOpenAICompatibleVisionModel } from "@/lib/llm/openaiCompatible";
import type { VisionModel } from "@/lib/llm/types";

// 활성 제공자 설정을 읽어 비전 모델 어댑터를 만든다.
// 키가 설정에 없으면 env 폴백(Anthropic만, 하위 호환).
export async function getVisionModel(): Promise<VisionModel> {
  const settings = await getSettingsStore().get();
  const active = settings.activeProvider;
  const cfg = settings.providers[active];
  const preset = PROVIDER_PRESETS[active];
  const model = cfg.model && cfg.model.trim() ? cfg.model.trim() : preset.defaultModel;

  const apiKey =
    cfg.apiKey ?? (active === "anthropic" ? process.env.ANTHROPIC_API_KEY : undefined);
  if (!apiKey) {
    throw new Error(
      `${preset.label} API 키가 설정되지 않았습니다. 대시보드 설정(/settings)에서 키를 추가하세요.`,
    );
  }

  if (active === "anthropic") {
    return createAnthropicVisionModel({ apiKey, model });
  }
  // openai / kimi / gemini → OpenAI 호환
  return createOpenAICompatibleVisionModel({ apiKey, baseURL: preset.baseURL!, model });
}
