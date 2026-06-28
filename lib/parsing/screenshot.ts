import { ScreenshotParseSchema, type ScreenshotParse } from "@/lib/schemas";
import type { VisionModel } from "@/lib/llm/types";

const SYSTEM_PROMPT = `너는 Instagram/EDIT 인사이트 스크린샷에서 수치를 정확히 읽어내는 파서다.
이미지에서 다음만 추출해 JSON으로만 답하라(설명·코드펜스 금지):
- hookRetention3s: 3초 시점 잔존율(%) 숫자
- retentionCurve: 잔존 곡선 좌표 배열 [{sec, pct}], 곡선이 안 보이면 생략
- reachSources: 유입 소스 비율 {reelsTab, explore, home, profile, other}(%) — 보이는 것만
보이지 않는 값은 필드를 생략하라. 추측 금지.`;

// 응답에서 첫 '{' ~ 마지막 '}' 사이만 추출 (코드펜스/잡설 방어)
function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("응답에서 JSON 객체를 찾지 못했습니다");
  }
  return text.slice(start, end + 1);
}

export async function parseScreenshot(
  imageBase64: string,
  mediaType: string,
  model: VisionModel,
): Promise<ScreenshotParse> {
  const text = await model.extractJson({
    system: SYSTEM_PROMPT,
    userText: "이 스크린샷의 수치를 JSON으로 추출해줘.",
    imageBase64,
    mediaType,
  });
  const json: unknown = JSON.parse(extractJsonObject(text));
  return ScreenshotParseSchema.parse(json);
}
