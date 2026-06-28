import { parseScreenshot } from "@/lib/parsing/screenshot";
import type { VisionModel } from "@/lib/llm/types";

const validJson = JSON.stringify({
  hookRetention3s: 35.3,
  retentionCurve: [{ sec: 0, pct: 100 }, { sec: 3, pct: 35.3 }],
  reachSources: { reelsTab: 60, explore: 30, home: 10 },
});

function fakeModel(text: string): VisionModel {
  return { extractJson: async () => text };
}

test("VisionModel 응답 JSON을 ScreenshotParse로 검증·반환한다", async () => {
  const result = await parseScreenshot("ZmFrZQ==", "image/png", fakeModel(validJson));
  expect(result.hookRetention3s).toBeCloseTo(35.3, 3);
  expect(result.retentionCurve).toHaveLength(2);
  expect(result.reachSources?.reelsTab).toBe(60);
});

test("코드펜스로 감싼 JSON도 파싱한다", async () => {
  const fenced = "```json\n" + validJson + "\n```";
  const result = await parseScreenshot("x", "image/png", fakeModel(fenced));
  expect(result.hookRetention3s).toBeCloseTo(35.3, 3);
});

test("스키마에 안 맞는 응답은 throw", async () => {
  await expect(
    parseScreenshot("x", "image/png", fakeModel('{"hookRetention3s": 999}')),
  ).rejects.toThrow();
});
