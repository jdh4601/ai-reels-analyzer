import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseSrt } from "@/lib/parsing/srt";

const raw = readFileSync(join(__dirname, "fixtures/sample.srt"), "utf8");

test("SRT 타임코드를 초로 변환한다", () => {
  const lines = parseSrt(raw);
  expect(lines[0]).toEqual({ startSec: 0, endSec: 2.5, text: "연구개발에 실패해서" });
});

test("멀티라인 텍스트를 공백으로 합친다", () => {
  const lines = parseSrt(raw);
  expect(lines[1].text).toBe("모든 걸 잃었습니다 그리고 다시 시작했죠");
});

test("총 3개 라인을 파싱한다", () => {
  expect(parseSrt(raw)).toHaveLength(3);
});

test("빈 입력은 빈 배열", () => {
  expect(parseSrt("")).toEqual([]);
  expect(parseSrt("   \n\n  ")).toEqual([]);
});
