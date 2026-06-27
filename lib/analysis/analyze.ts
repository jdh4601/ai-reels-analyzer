import type { Reel } from "@/lib/schemas";
import { diagnose, type Diagnosis } from "@/lib/analysis/diagnosis";
import { detectDrops, type DropSegment } from "@/lib/analysis/dropDetection";
import { buildPlaybook, type Prescription } from "@/lib/recommend/playbook";
import { buildBaselineThresholds, deltaVsRecent } from "@/lib/analysis/baseline";
import { BENCHMARKS, type MetricKey } from "@/config/benchmarks";

export interface AnalyzeResult {
  diagnosis: Diagnosis;
  drops: DropSegment[];
  prescriptions: Prescription[];
  baselineActive: boolean;
  bottleneckDelta: number | null; // 병목 지표의 최근 3개 대비 델타
}

export function analyzeReel(reel: Reel, history: Reel[]): AnalyzeResult {
  const baseline = buildBaselineThresholds(history);
  const thresholds = baseline ?? BENCHMARKS;
  const diagnosis = diagnose(reel, thresholds);
  const drops = detectDrops(reel.retentionCurve ?? [], reel.transcript ?? []);
  const prescriptions = buildPlaybook(diagnosis, drops);

  const recent = history.slice(-3);
  const bottleneckDelta = diagnosis.bottleneck
    ? deltaVsRecent(reel, recent, diagnosis.bottleneck.key as MetricKey)
    : null;

  return { diagnosis, drops, prescriptions, baselineActive: baseline !== null, bottleneckDelta };
}
