import Anthropic from "@anthropic-ai/sdk";
import { ScreenshotParseSchema, type ScreenshotParse } from "@/lib/schemas";

export interface AnthropicLike {
  messages: {
    create(args: unknown): Promise<{ content: Array<{ type: string; text?: string }> }>;
  };
}

const SYSTEM_PROMPT = `너는 Instagram/EDIT 인사이트 스크린샷에서 수치를 정확히 읽어내는 파서다.
이미지에서 다음만 추출해 JSON으로만 답하라(설명·코드펜스 금지):
- hookRetention3s: 3초 시점 잔존율(%) 숫자
- retentionCurve: 잔존 곡선 좌표 배열 [{sec, pct}], 곡선이 안 보이면 생략
- reachSources: 유입 소스 비율 {reelsTab, explore, home, profile, other}(%) — 보이는 것만
보이지 않는 값은 필드를 생략하라. 추측 금지.`;

function extractText(content: Array<{ type: string; text?: string }>): string {
  const block = content.find((b) => b.type === "text" && b.text);
  if (!block?.text) throw new Error("Vision 응답에 텍스트 블록이 없습니다");
  return block.text.trim();
}

export async function parseScreenshot(
  imageBase64: string,
  mediaType: string,
  client: AnthropicLike,
): Promise<ScreenshotParse> {
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
          { type: "text", text: "이 스크린샷의 수치를 JSON으로 추출해줘." },
        ],
      },
    ],
  });

  const text = extractText(response.content);
  const json: unknown = JSON.parse(text);
  return ScreenshotParseSchema.parse(json);
}

export function getAnthropicClient(): AnthropicLike {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY 가 설정되지 않았습니다 (.env.local)");
  return new Anthropic({ apiKey }) as unknown as AnthropicLike;
}
