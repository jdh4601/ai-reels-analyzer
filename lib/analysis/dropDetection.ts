import type { RetentionPoint, TranscriptLine } from "@/lib/schemas";
import { DROP_THRESHOLD_PCT_PER_SEC, HOOK_WINDOW_SEC } from "@/config/benchmarks";

export interface DropSegment {
  startSec: number;
  endSec: number;
  dropPct: number;   // 구간 동안 하락한 잔존 %p
  isHook: boolean;
  lines: TranscriptLine[];
}

function overlappingLines(
  startSec: number,
  endSec: number,
  transcript: TranscriptLine[],
): TranscriptLine[] {
  return transcript.filter((l) => l.startSec < endSec && l.endSec > startSec);
}

export function detectDrops(
  curve: RetentionPoint[],
  transcript: TranscriptLine[] = [],
  thresholdPctPerSec: number = DROP_THRESHOLD_PCT_PER_SEC,
): DropSegment[] {
  if (curve.length < 2) return [];

  const segments: DropSegment[] = [];
  for (let i = 1; i < curve.length; i++) {
    const prev = curve[i - 1];
    const cur = curve[i];
    const span = cur.sec - prev.sec;
    if (span <= 0) continue;

    const dropPct = prev.pct - cur.pct;
    const dropPerSec = dropPct / span;
    if (dropPerSec <= thresholdPctPerSec) continue;

    segments.push({
      startSec: prev.sec,
      endSec: cur.sec,
      dropPct,
      isHook: cur.sec <= HOOK_WINDOW_SEC,
      lines: overlappingLines(prev.sec, cur.sec, transcript),
    });
  }

  return segments.sort((a, b) => b.dropPct - a.dropPct);
}
