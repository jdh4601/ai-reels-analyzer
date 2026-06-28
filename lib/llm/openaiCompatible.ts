import OpenAI from "openai";
import type { VisionModel } from "@/lib/llm/types";

// 테스트 주입용 최소 인터페이스 (OpenAI SDK의 chat.completions.create 부분만)
export interface OpenAILike {
  chat: {
    completions: {
      create(args: unknown): Promise<{ choices: Array<{ message: { content: string | null } }> }>;
    };
  };
}

interface Options {
  apiKey: string;
  baseURL: string;
  model: string;
  client?: OpenAILike;
}

// OpenAI 호환 제공자(OpenAI / Kimi-Moonshot / Gemini OpenAI엔드포인트 등) 비전 어댑터
export function createOpenAICompatibleVisionModel(opts: Options): VisionModel {
  const client: OpenAILike =
    opts.client ?? (new OpenAI({ apiKey: opts.apiKey, baseURL: opts.baseURL }) as unknown as OpenAILike);

  return {
    async extractJson({ system, userText, imageBase64, mediaType }) {
      const response = await client.chat.completions.create({
        model: opts.model,
        max_tokens: 1024,
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "image_url", image_url: { url: `data:${mediaType};base64,${imageBase64}` } },
            ],
          },
        ],
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Vision 응답이 비어 있습니다");
      return content.trim();
    },
  };
}
