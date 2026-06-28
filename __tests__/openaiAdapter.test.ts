import { createOpenAICompatibleVisionModel } from "@/lib/llm/openaiCompatible";

test("OpenAI 호환 어댑터는 content를 반환하고 이미지를 data URL로 보낸다", async () => {
  let captured: unknown = null;
  const fakeClient = {
    chat: {
      completions: {
        create: async (args: unknown) => {
          captured = args;
          return { choices: [{ message: { content: '{"hookRetention3s": 42}' } }] };
        },
      },
    },
  };
  const model = createOpenAICompatibleVisionModel({
    apiKey: "k", baseURL: "https://api.moonshot.ai/v1", model: "moonshot-v1-8k-vision-preview",
    client: fakeClient,
  });
  const text = await model.extractJson({
    system: "sys", userText: "추출", imageBase64: "ZmFrZQ==", mediaType: "image/png",
  });
  expect(text).toBe('{"hookRetention3s": 42}');
  // 이미지가 data URL 형태로 전달되는지 확인
  expect(JSON.stringify(captured)).toContain("data:image/png;base64,ZmFrZQ==");
});

test("빈 content면 throw", async () => {
  const fakeClient = {
    chat: { completions: { create: async () => ({ choices: [{ message: { content: null } }] }) } },
  };
  const model = createOpenAICompatibleVisionModel({
    apiKey: "k", baseURL: "https://x/v1", model: "m", client: fakeClient,
  });
  await expect(
    model.extractJson({ system: "s", userText: "u", imageBase64: "x", mediaType: "image/png" }),
  ).rejects.toThrow();
});
