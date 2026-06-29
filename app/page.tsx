"use client";
import { useEffect, useState, type FormEvent } from "react";
import type { Reel, AccountSnapshot, AccountProfile } from "@/lib/schemas";
import type { AnalyzeResult } from "@/lib/analysis/analyze";
import { buildAccountOverview } from "@/lib/analysis/accountOverview";
import { latestFollowerDelta } from "@/lib/analysis/followerTrend";
import { AppBar } from "@/components/AppBar";
import { AccountHeader } from "@/components/AccountHeader";
import { AccountOverview } from "@/components/AccountOverview";
import { ReelPicker } from "@/components/ReelPicker";
import { FollowerGrowthChart } from "@/components/FollowerGrowthChart";
import { BottleneckBanner } from "@/components/BottleneckBanner";
import { DiagnosisCards } from "@/components/DiagnosisCards";
import { MetricBars } from "@/components/MetricBars";
import { RetentionChart } from "@/components/RetentionChart";
import { GrowthTrend } from "@/components/GrowthTrend";
import { SolutionsPanel } from "@/components/SolutionsPanel";
import { AiGenerationPanel } from "@/components/AiGenerationPanel";

export default function Page() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [snapshots, setSnapshots] = useState<AccountSnapshot[]>([]);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [snapDate, setSnapDate] = useState("");
  const [snapFollowers, setSnapFollowers] = useState("");
  const [syncStatus, setSyncStatus] = useState("");
  const [syncing, setSyncing] = useState(false);

  async function onSync() {
    setSyncing(true);
    setSyncStatus("");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setSyncStatus("동기화 실패: " + (data.error ?? "오류"));
        return;
      }
      const [reelsRes, snapsRes, profileRes] = await Promise.all([
        fetch("/api/reels").then((r) => r.json()),
        fetch("/api/snapshots").then((r) => r.json()),
        fetch("/api/profile").then((r) => r.json()),
      ]);
      setReels(reelsRes.reels);
      setSnapshots(snapsRes.snapshots);
      setProfile(profileRes.profile);
      setSyncStatus(`동기화 완료: 릴스 ${data.syncedReels}개 · @${data.username}`);
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    fetch("/api/reels")
      .then((r) => r.json())
      .then((d) => setReels(d.reels));
    fetch("/api/snapshots")
      .then((r) => r.json())
      .then((d) => setSnapshots(d.snapshots));
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile));
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
  const overview = buildAccountOverview(reels, snapshots, profile);
  const followerDelta = latestFollowerDelta(snapshots);

  return (
    <>
      <AppBar onSync={onSync} syncing={syncing} />
      <main className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
        <AccountHeader profile={profile} followerDelta={followerDelta} />
        <AccountOverview overview={overview} />

        <ReelPicker reels={reels} selectedId={selectedId} onSelect={setSelectedId} />

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
          <DiagnosisCards
            strengths={analysis.diagnosis.strengths}
            weaknesses={analysis.diagnosis.weaknesses}
          />
          <MetricBars verdicts={analysis.diagnosis.verdicts} />
          <RetentionChart curve={selected.retentionCurve ?? []} drops={analysis.drops} />
          <GrowthTrend reels={reels} />
          <SolutionsPanel prescriptions={analysis.prescriptions} />
          <AiGenerationPanel reelId={selected.id} />
        </>
      )}
        {!selected && <p className="text-neutral-500">릴스를 선택하면 분석이 표시됩니다.</p>}
      </main>

      {syncStatus && (
        <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white shadow-card-hover">
          {syncStatus}
        </div>
      )}
    </>
  );
}
