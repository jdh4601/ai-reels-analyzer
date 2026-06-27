import { parseScreenshot } from "@/lib/parsing/screenshot";

const fakeClient = {
  messages: {
    create: async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            hookRetention3s: 35.3,
            retentionCurve: [{ sec: 0, pct: 100 }, { sec: 3, pct: 35.3 }],
            reachSources: { reelsTab: 60, explore: 30, home: 10 },
          }),
        },
      ],
    }),
  },
};

test("Vision 응답 JSON을 ScreenshotParse로 검증·반환한다", async () => {
  const result = await parseScreenshot("ZmFrZQ==", "image/png", fakeClient);
  expect(result.hookRetention3s).toBeCloseTo(35.3, 3);
  expect(result.retentionCurve).toHaveLength(2);
  expect(result.reachSources?.reelsTab).toBe(60);
});

test("스키마에 안 맞는 응답은 throw", async () => {
  const badClient = {
    messages: { create: async () => ({ content: [{ type: "text", text: '{"hookRetention3s": 999}' }] }) },
  };
  await expect(parseScreenshot("x", "image/png", badClient)).rejects.toThrow();
});
