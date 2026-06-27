import type { TranscriptLine } from "@/lib/schemas";

const TIME_RE =
  /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/;

function toSeconds(h: string, m: string, s: string, ms: string): number {
  return Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
}

export function parseSrt(raw: string): TranscriptLine[] {
  const blocks = raw.split(/\r?\n\r?\n/);
  const lines: TranscriptLine[] = [];

  for (const block of blocks) {
    const rows = block.split(/\r?\n/).map((r) => r.trim()).filter(Boolean);
    if (rows.length === 0) continue;

    const timeRowIdx = rows.findIndex((r) => TIME_RE.test(r));
    if (timeRowIdx === -1) continue;

    const m = TIME_RE.exec(rows[timeRowIdx]);
    if (!m) continue;

    const startSec = toSeconds(m[1], m[2], m[3], m[4]);
    const endSec = toSeconds(m[5], m[6], m[7], m[8]);
    const text = rows.slice(timeRowIdx + 1).join(" ");
    lines.push({ startSec, endSec, text });
  }
  return lines;
}
