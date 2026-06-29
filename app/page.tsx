"use client";
import { useEffect, useState, type FormEvent } from "react";
import type { Reel, AccountSnapshot, AccountProfile } from "@/lib/schemas";
import { buildAccountOverview } from "@/lib/analysis/accountOverview";
import { latestFollowerDelta } from "@/lib/analysis/followerTrend";
import { AppBar } from "@/components/AppBar";
import { AccountHeader } from "@/components/AccountHeader";
import { AccountOverview } from "@/components/AccountOverview";
import { Input, Button } from "@/components/ui";
import { ReelPicker } from "@/components/ReelPicker";
import { FollowerGrowthChart } from "@/components/FollowerGrowthChart";
import { GrowthTrend } from "@/components/GrowthTrend";

export default function Page() {
  const [reels, setReels] = useState<Reel[]>([]);
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

  const overview = buildAccountOverview(reels, snapshots, profile);
  const followerDelta = latestFollowerDelta(snapshots);

  return (
    <>
      <AppBar onSync={onSync} syncing={syncing} />
      <main className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
        <AccountHeader profile={profile} followerDelta={followerDelta} />
        <AccountOverview overview={overview} />

        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-neutral-700">릴스 — 카드를 클릭하면 상세 분석</h2>
          <ReelPicker reels={reels} />
        </div>

        <FollowerGrowthChart snapshots={snapshots} />
        <form onSubmit={addSnapshot} className="flex flex-wrap items-center gap-2 text-sm">
          <Input type="date" value={snapDate} onChange={(e) => setSnapDate(e.target.value)} />
          <Input
            type="number"
            placeholder="팔로워 수"
            className="w-32"
            value={snapFollowers}
            onChange={(e) => setSnapFollowers(e.target.value)}
          />
          <Button type="submit">스냅샷 추가</Button>
        </form>

        <GrowthTrend reels={reels} />
      </main>

      {syncStatus && (
        <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white shadow-card-hover">
          {syncStatus}
        </div>
      )}
    </>
  );
}
