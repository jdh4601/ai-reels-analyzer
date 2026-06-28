import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSettingsStore } from "@/lib/settings/store";

function tmpStore() {
  const dir = mkdtempSync(join(tmpdir(), "settings-"));
  return createSettingsStore(dir);
}

test("기본값: activeProvider=anthropic, 키 없음", async () => {
  const s = await tmpStore().get();
  expect(s.activeProvider).toBe("anthropic");
  expect(s.providers.anthropic.apiKey).toBeUndefined();
});

test("save 후 get으로 키·모델·활성 제공자 조회", async () => {
  const store = tmpStore();
  await store.save({
    activeProvider: "kimi",
    providers: { kimi: { apiKey: "sk-kimi-secret-9999", model: "moonshot-v1-32k-vision-preview" } },
  });
  const s = await store.get();
  expect(s.activeProvider).toBe("kimi");
  expect(s.providers.kimi.apiKey).toBe("sk-kimi-secret-9999");
  expect(s.providers.kimi.model).toBe("moonshot-v1-32k-vision-preview");
});

test("빈 apiKey로 save하면 기존 키를 유지(덮어쓰지 않음)", async () => {
  const store = tmpStore();
  await store.save({ providers: { openai: { apiKey: "sk-openai-keep-1234" } } });
  await store.save({ activeProvider: "openai", providers: { openai: { apiKey: "" } } });
  const s = await store.get();
  expect(s.providers.openai.apiKey).toBe("sk-openai-keep-1234");
});

test("masked()는 실제 키 대신 마스킹값과 configured 플래그를 반환", async () => {
  const store = tmpStore();
  await store.save({ providers: { anthropic: { apiKey: "sk-ant-abcdef1234" } } });
  const m = await store.masked();
  expect(m.providers.anthropic.configured).toBe(true);
  expect(m.providers.anthropic.maskedKey).toBe("sk-…1234");
  expect(m.providers.kimi.configured).toBe(false);
  expect(m.providers.kimi.maskedKey).toBeNull();
  // 실제 키 문자열이 새어나오지 않는다
  expect(JSON.stringify(m)).not.toContain("abcdef1234");
});

test("Instagram 토큰 저장/조회 + 마스킹(누설 없음)", async () => {
  const store = tmpStore();
  await store.save({ instagram: { accessToken: "IGtoken-secret-7777" } });
  const s = await store.get();
  expect(s.instagram?.accessToken).toBe("IGtoken-secret-7777");
  const m = await store.masked();
  expect(m.instagram.configured).toBe(true);
  expect(m.instagram.maskedKey).toBe("IGt…7777");
  expect(JSON.stringify(m)).not.toContain("secret-7777");
});

test("Instagram 토큰 빈 값 저장은 기존 토큰 유지", async () => {
  const store = tmpStore();
  await store.save({ instagram: { accessToken: "IGtoken-keep-1234" } });
  await store.save({ instagram: { accessToken: "" } });
  const s = await store.get();
  expect(s.instagram?.accessToken).toBe("IGtoken-keep-1234");
});
