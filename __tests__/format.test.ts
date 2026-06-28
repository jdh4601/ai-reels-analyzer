import { bandColor, fmtPct, fmtDelta } from "@/lib/ui/format";

test("밴드별 색 클래스 (토큰 기반)", () => {
  expect(bandColor("weak")).toContain("band-weak");
  expect(bandColor("ok")).toContain("band-ok");
  expect(bandColor("strong")).toContain("band-strong");
});

test("퍼센트 포맷", () => {
  expect(fmtPct(1.7)).toBe("1.70%");
});

test("델타 부호 표기", () => {
  expect(fmtDelta(7)).toBe("▲7.0%p");
  expect(fmtDelta(-3.2)).toBe("▼3.2%p");
  expect(fmtDelta(0)).toBe("—");
});
