import { ScreenshotParseSchema, type ScreenshotParse } from "@/lib/schemas";
import type { VisionModel } from "@/lib/llm/types";

export type ImageType = "edit" | "audience" | "watchTime" | "skipRate";

const BASE_INSTRUCTION = `너는 Instagram 인사이트 스크린샷에서 수치를 정확히 읽어내는 파서다.
이미지에서 요청한 필드만 추출해 JSON으로만 답하라(설명·코드펜스 금지).
보이지 않는 값은 필드를 생략하라. 추측 금지.`;

function systemPrompt(type: ImageType): string {
  switch (type) {
    case "audience":
      return `${BASE_INSTRUCTION}
이 스크린샷은 "계정 상태"의 팔로워/팔로워가 아닌 사람 비중 차트다.
추출 필드:
- audienceBreakdown: { followersPct: 팔로워 비율(%), nonFollowersPct: 팔로워가 아닌 사람 비율(%) }`;
    case "watchTime":
      return `${BASE_INSTRUCTION}
이 스크린샷은 "얼마나 오래 보는지" 또는 "시청 지속 시간" 그래프다.
추출 필드:
- watchTimeBuckets: 시청 지속 시간 분포 배열 [{label: 구간명(예: "0~3초", "3~10초", "10초~"), pct: 해당 구간 비율(%)}]. 화면에 보이는 구간대로 추출.`;
    case "skipRate":
      return `${BASE_INSTRUCTION}
이 스크린샷은 Instagram 인사이트의 "Skip rate" 또는 "스킵 비율" 지표다.
추출 필드:
- skipRate: 스킵 비율(%) 숫자. 보통 0~100 사이. 화면에 "Skipped" 또는 "스킵"이라고 표시된 값.`;
    default:
      return `${BASE_INSTRUCTION}
이 스크린샷은 Instagram/EDIT 인사이트 스크린샷이다.
추출 필드:
- hookRetention3s: 3초 시점 잔존율(%) 숫자
- retentionCurve: 잔존 곡선 좌표 배열 [{sec, pct}], 곡선이 안 보이면 생략
- reachSources: 유입 소스 비율 {reelsTab, explore, home, profile, other}(%) — 보이는 것만`;
  }
}

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
  imageType: ImageType = "edit",
): Promise<ScreenshotParse> {
  const text = await model.extractJson({
    system: systemPrompt(imageType),
    userText: "이 스크린샷의 수치를 JSON으로 추출해줘.",
    imageBase64,
    mediaType,
  });
  const json: unknown = JSON.parse(extractJsonObject(text));
  return ScreenshotParseSchema.parse(json);
}
