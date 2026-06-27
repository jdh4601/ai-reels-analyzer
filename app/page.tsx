"use client";
import { useEffect, useState } from "react";
import type { Reel } from "@/lib/schemas";
import type { AnalyzeResult } from "@/lib/analysis/analyze";
import { ReelPicker } from "@/components/ReelPicker";
import { BottleneckBanner } from "@/components/BottleneckBanner";
import { DiagnosisCards } from "@/components/DiagnosisCards";
import { MetricBars } from "@/components/MetricBars";
import { RetentionChart } from "@/components/RetentionChart";
import { GrowthTrend } from "@/components/GrowthTrend";
import { SolutionsPanel } from "@/components/SolutionsPanel";

export default function Page() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);

  useEffect(() => {
    fetch("/api/reels")
      .then((r) => r.json())
      .then((d) => setReels(d.reels));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reelId: selectedId }),
    })
      .then((r) => r.json())
      .then(setAnalysis);
  }, [selectedId]);

  const selected = reels.find((r) => r.id === selectedId) ?? null;

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">릴스 분석 대시보드</h1>
        <div className="flex gap-2 items-center">
          <ReelPicker reels={reels} selectedId={selectedId} onSelect={setSelectedId} />
          <a href="/upload" className="text-sm text-blue-600 underline">
            📷 업로드
          </a>
        </div>
      </div>

      {analysis && selected && (
        <>
          <BottleneckBanner
            bottleneck={analysis.diagnosis.bottleneck}
            delta={analysis.bottleneckDelta}
          />
          <div className="grid grid-cols-2 gap-3">
            <DiagnosisCards
              strengths={analysis.diagnosis.strengths}
              weaknesses={analysis.diagnosis.weaknesses}
            />
            <MetricBars verdicts={analysis.diagnosis.verdicts} />
          </div>
          <RetentionChart curve={selected.retentionCurve ?? []} drops={analysis.drops} />
          <GrowthTrend reels={reels} />
          <SolutionsPanel prescriptions={analysis.prescriptions} />
        </>
      )}
      {!selected && <p className="text-neutral-500">릴스를 선택하면 분석이 표시됩니다.</p>}
    </main>
  );
}
