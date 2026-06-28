// 비전 모델 공통 인터페이스 — 제공자(Anthropic/OpenAI/Kimi/Gemini)를 추상화.
// 이미지 + 지시 프롬프트를 받아 텍스트(JSON 문자열)를 반환한다.
export interface VisionExtractArgs {
  system: string;
  userText: string;
  imageBase64: string;
  mediaType: string;
}

export interface VisionModel {
  extractJson(args: VisionExtractArgs): Promise<string>;
}

// 텍스트 생성 (이미지 없음) — Phase 3 맞춤 대본 생성용. 모든 제공자 공통.
export interface TextGenerateArgs {
  system: string;
  userText: string;
}

export interface TextModel {
  generate(args: TextGenerateArgs): Promise<string>;
}
