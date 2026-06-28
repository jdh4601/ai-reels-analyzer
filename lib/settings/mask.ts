// API 키를 클라이언트에 노출할 때 마스킹 (앞 3자 + 뒤 4자). 짧으면 전부 가림.
export function maskApiKey(key: string): string {
  if (key.length <= 7) return "****";
  return `${key.slice(0, 3)}…${key.slice(-4)}`;
}
