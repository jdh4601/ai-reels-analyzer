// 조건부 className 병합 (truthy만 공백 결합)
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
