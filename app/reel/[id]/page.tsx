"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Film, Eye, Users, Heart, MessageCircle, Bookmark, Share2, Clock } from "lucide-react";
import type { Reel, ReelMetricSnapshot } from "@/lib/schemas";
import type { AnalyzeResult } from "@/lib/analysis/analyze";
import type { ReelKpiDeltas, ReelKpiKey } from "@/lib/analysis/reelKpiDeltas";
import { reelTitle } from "@/lib/ui/reelTitle";
import { fmtCount } from "@/lib/ui/format";
import { Stat, Skeleton, EmptyState } from "@/components/ui";
import { BottleneckBanner } from "@/components/BottleneckBanner";
import { DiagnosisCards } from "@/components/DiagnosisCards";
import { MetricBars } from "@/components/MetricBars";
import { RetentionChart } from "@/components/RetentionChart";
import { ReelMetricTrend } from "@/components/ReelMetricTrend";
import { ScreenshotUploadCard } from "@/components/ScreenshotUploadCard";
import { SrtUploadCard } from "@/components/SrtUploadCard";
import { AudienceBreakdownCard } from "@/components/AudienceBreakdownCard";
import { WatchTimeBucketsChart } from "@/components/WatchTimeBucketsChart";
import { SolutionsPanel } from "@/components/SolutionsPanel";
import { AiGenerationPanel } from "@/components/AiGenerationPanel";

interface DetailResponse {
  reel: Reel;
  analysis: AnalyzeResult;
  metricHistory: ReelMetricSnapshot[];
  kpiDeltas?: ReelKpiDeltas;
}

// 평균 대비 변화율 힌트: +12% 초록 / -8% 빨강 / 데이터 없으면 표시 안 함
function DeltaHint({ pct }: { pct: number | null | undefined }) {
  if (pct == null) return null;
  const rounded = Math.round(pct);
  if (rounded === 0) return <span className="text-neutral-400">평균 수준</span>;
  const up = rounded > 0;
  return (
    <span className={up ? "text-band-strong" : "text-band-weak"}>
      평균 대비 {up ? "+" : ""}{rounded}%
    </span>
  );
}

export default function ReelDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [data, setData] = useState<DetailResponse | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const r = await fetch(`/api/reels/${id}`);
      if (!r.ok) {
        setError((await r.json()).error ?? "불러오기 실패");
        return;
      }
      setData(await r.json());
    } catch {
      setError("네트워크 오류");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
      <a href="/" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
        <ArrowLeft size={14} /> 대시보드
      </a>

      {error && <EmptyState icon={<Film size={26} />} title={error} />}

      {!error && !data && (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {data && <ReelDetail {...data} onChange={load} />}
    </main>
  );
}

function ReelDetail({ reel, analysis, metricHistory, kpiDeltas, onChange }: DetailResponse & { onChange: () => void }) {
  const delta = (key: ReelKpiKey) => <DeltaHint pct={kpiDeltas?.[key]} />;
  return (
    <>
      {/* 헤더 */}
      <div className="flex gap-4">
        <div className="relative aspect-[9/16] w-24 shrink-0 overflow-hidden rounded-card border border-border-subtle bg-neutral-100">
          {reel.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={reel.thumbnailUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-300">
              <Film size={26} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold leading-snug text-neutral-900">{reelTitle(reel)}</h1>
          <p className="mt-1 text-sm text-neutral-500">{reel.postedAt.slice(0, 10)}</p>
          {reel.permalink && (
            <a
              href={reel.permalink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
            >
              <ExternalLink size={14} /> 인스타그램에서 보기
            </a>
          )}
        </div>
      </div>

      {/* 전체 지표 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="조회수" value={fmtCount(reel.views)} icon={<Eye size={16} />} hint={delta("views")} />
        <Stat
          label="도달"
          value={fmtCount(reel.reach)}
          icon={<Users size={16} />}
          hint={
            reel.reach < reel.views ? (
              <span className="text-neutral-400">고유 시청자 · 조회수는 반복 시청 포함</span>
            ) : (
              delta("reach")
            )
          }
        />
        <Stat label="좋아요" value={fmtCount(reel.likes)} icon={<Heart size={16} />} hint={delta("likes")} />
        <Stat label="댓글" value={fmtCount(reel.comments)} icon={<MessageCircle size={16} />} hint={delta("comments")} />
        <Stat label="저장" value={fmtCount(reel.saves)} icon={<Bookmark size={16} />} hint={delta("saves")} />
        <Stat label="공유" value={fmtCount(reel.shares)} icon={<Share2 size={16} />} hint={delta("shares")} />
        <Stat label="평균 시청" value={`${reel.avgWatchTimeSec.toFixed(1)}초`} icon={<Clock size={16} />} hint={delta("avgWatchTimeSec")} />
        {typeof reel.followsFromReel === "number" && (
          <Stat label="이 릴스로 팔로우" value={fmtCount(reel.followsFromReel)} icon={<Users size={16} />} />
        )}
      </div>

      <BottleneckBanner bottleneck={analysis.diagnosis.bottleneck} delta={analysis.bottleneckDelta} />
      <ReelMetricTrend history={metricHistory} />
      <RetentionChart curve={reel.retentionCurve ?? []} drops={analysis.drops} />
      <SrtUploadCard reelId={reel.id} analysis={analysis.transcript} onChange={onChange} />
      <AudienceBreakdownCard breakdown={reel.audienceBreakdown} />
      <WatchTimeBucketsChart buckets={reel.watchTimeBuckets} />
      <ScreenshotUploadCard reelId={reel.id} />
      <DiagnosisCards
        strengths={analysis.diagnosis.strengths}
        weaknesses={analysis.diagnosis.weaknesses}
      />
      <MetricBars verdicts={analysis.diagnosis.verdicts} baselineActive={analysis.baselineActive} />
      <SolutionsPanel prescriptions={analysis.prescriptions} />
      <AiGenerationPanel reelId={reel.id} />
    </>
  );
}
