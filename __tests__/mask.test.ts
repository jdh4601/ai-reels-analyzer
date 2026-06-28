import { maskApiKey } from "@/lib/settings/mask";

test("긴 키는 앞 3자 + 뒤 4자만 노출", () => {
  expect(maskApiKey("sk-ant-abcdef1234")).toBe("sk-…1234");
});

test("짧은 키는 전부 가린다", () => {
  expect(maskApiKey("short")).toBe("****");
  expect(maskApiKey("1234567")).toBe("****");
});
