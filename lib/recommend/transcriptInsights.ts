import type { Reel, TranscriptInsights } from "@/lib/schemas";
import { TranscriptInsightsSchema } from "@/lib/schemas";
import { computeDerivedRates } from "@/lib/analysis/metrics";
import type { TextModel } from "@/lib/llm/types";

const SYSTEM_PROMPT = `너는 인스타그램 릴스의 자막(대본)과 성과 지표를 함께 보고
"왜 이 지표가 이렇게 나왔는지"를 자막 내용에서 찾아내는 분석가다.
추측성 일반론이 아니라, 주어진 자막의 구체적 문장·구성과 실제 지표를 연결해 원인을 설명하라.
반드시 아래 형태의 JSON으로만 답하라(설명·코드펜스 금지):
{
  "summary": "한두 문장 총평",
  "strengths": [{"title":"짧은 제목","detail":"자막 근거 + 연결 지표로 원인 설명","metric":"연결 지표 키(선택)"}],
  "weaknesses": [{"title":"짧은 제목","detail":"자막 근거 + 연결 지표로 원인 설명","metric":"연결 지표 키(선택)"}]
}
metric 키 예: skipRate(스킵률), completionRate(완주율), shareRate(공유율), saveRate(저장율),
commentRate(댓글율), followRate(팔로우전환율). 강점·약점은 각 1~3개. 근거 없는 항목은 넣지 마라.`;

function transcriptBlock(reel: Reel): string {
  if (!reel.transcript || reel.transcript.length === 0) return "(자막 없음)";
  return reel.transcript.map((l) => `[${l.startSec}-${l.endSec}s] ${l.text}`).join("\n");
}

function metricsBlock(reel: Reel): string {
  const d = reel.derived ?? computeDerivedRates(reel);
  const durTxt = reel.durationSec > 0 ? `${reel.durationSec}초` : "미상";
  const skipTxt =
    reel.skipRate != null
      ? `${reel.skipRate}% (3초 잔존 ${(100 - reel.skipRate).toFixed(1)}%)`
      : reel.hookRetention3s != null
        ? `3초 잔존 ${reel.hookRetention3s}%`
        : "미상";
  const rows = [
    `영상 길이: ${durTxt}`,
    `조회수: ${reel.views} · 도달: ${reel.reach}`,
    `평균 시청: ${reel.avgWatchTimeSec}초`,
    `3초 스킵/이탈: ${skipTxt}`,
    `완주율: ${reel.durationSec > 0 ? d.completionRate.toFixed(1) + "%" : "미상(길이 없음)"}`,
    `좋아요율 ${d.likeRate.toFixed(2)}% · 댓글율 ${d.commentRate.toFixed(2)}% · 저장율 ${d.saveRate.toFixed(2)}% · 공유율 ${d.shareRate.toFixed(2)}%`,
  ];
  if (reel.followsFromReel != null) rows.push(`이 릴스로 팔로우: ${reel.followsFromReel}`);
  return rows.join("\n");
}

export function buildTranscriptInsightsPrompt(reel: Reel): { system: string; userText: string } {
  const userText = [
    `캡션: ${reel.caption ?? "(없음)"}`,
    ``,
    `지표:`,
    metricsBlock(reel),
    ``,
    `자막(SRT):`,
    transcriptBlock(reel),
    ``,
    `위 자막 내용과 지표를 연결해 잘된 점·아쉬운 점의 원인을 JSON으로 분석해줘.`,
  ].join("\n");
  return { system: SYSTEM_PROMPT, userText };
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

export function parseTranscriptInsights(text: string): TranscriptInsights {
  const json: unknown = JSON.parse(extractJsonObject(text));
  return TranscriptInsightsSchema.parse(json);
}

export async function generateTranscriptInsights(
  reel: Reel,
  model: TextModel,
): Promise<TranscriptInsights> {
  const { system, userText } = buildTranscriptInsightsPrompt(reel);
  const text = await model.generate({ system, userText });
  return parseTranscriptInsights(text);
}
