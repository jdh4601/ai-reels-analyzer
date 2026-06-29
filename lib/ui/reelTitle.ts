import type { Reel } from "@/lib/schemas";

const MAX_LEN = 60;

// 릴스의 사람이 알아볼 수 있는 제목: caption 첫 줄 → 없으면 날짜 라벨.
// 숫자 ID 대신 카드/셀렉터 라벨에 사용.
export function reelTitle(reel: Reel): string {
  const firstLine = (reel.caption ?? "")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  if (!firstLine) {
    const date = reel.postedAt.slice(0, 10);
    return `릴스 · ${date}`;
  }

  if (firstLine.length > MAX_LEN) return `${firstLine.slice(0, MAX_LEN)}…`;
  return firstLine;
}
