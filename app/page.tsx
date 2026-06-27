"use client";
import { useEffect, useState, type FormEvent } from "react";
import type { Reel, AccountSnapshot } from "@/lib/schemas";
import type { AnalyzeResult } from "@/lib/analysis/analyze";
import { ReelPicker } from "@/components/ReelPicker";
import { FollowerGrowthChart } from "@/components/FollowerGrowthChart";
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
  const [snapshots, setSnapshots] = useState<AccountSnapshot[]>([]);
  const [snapDate, setSnapDate] = useState("");
  const [snapFollowers, setSnapFollowers] = useState("");

  useEffect(() => {
    fetch("/api/reels")
      .then((r) => r.json())
      .then((d) => setReels(d.reels));
    fetch("/api/snapshots")
      .then((r) => r.json())
      .then((d) => setSnapshots(d.snapshots));
  }, []);

  async function addSnapshot(e: FormEvent) {
    e.preventDefault();
    if (!snapDate || !snapFollowers) return;
    const res = await fetch("/api/snapshots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: snapDate,
        followerCount: Number(snapFollowers),
        reachLast7d: 0,
      }),
    });
    if (!res.ok) return;
    const refreshed = await fetch("/api/snapshots").then((r) => r.json());
    setSnapshots(refreshed.snapshots);
    setSnapDate("");
    setSnapFollowers("");
  }

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

      <FollowerGrowthChart snapshots={snapshots} />
      <form onSubmit={addSnapshot} className="flex gap-2 items-center text-sm">
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={snapDate}
          onChange={(e) => setSnapDate(e.target.value)}
        />
        <input
          type="number"
          placeholder="팔로워 수"
          className="border rounded px-2 py-1 w-32"
          value={snapFollowers}
          onChange={(e) => setSnapFollowers(e.target.value)}
        />
        <button type="submit" className="border rounded px-3 py-1 bg-neutral-100 hover:bg-neutral-200">
          스냅샷 추가
        </button>
      </form>

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
