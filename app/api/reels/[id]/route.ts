import { NextResponse } from "next/server";
import { getRepository, getReelHistoryRepository } from "@/lib/store";
import { analyzeReel } from "@/lib/analysis/analyze";
import { reelKpiDeltas } from "@/lib/analysis/reelKpiDeltas";
import { adjacentReelIds } from "@/lib/analysis/reelNavigation";

// 릴스 상세: reel + 분석 결과 + 지표 이력
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = getRepository();
  const reel = await repo.get(id);
  if (!reel) return NextResponse.json({ error: "릴스를 찾을 수 없습니다" }, { status: 404 });

  const all = await repo.list();
  const history = all
    .filter((r) => r.id !== reel.id)
    .sort((a, b) => a.postedAt.localeCompare(b.postedAt));
  const analysis = analyzeReel(reel, history);
  const metricHistory = await getReelHistoryRepository().list(id);
  const kpiDeltas = reelKpiDeltas(reel, history);
  const nav = adjacentReelIds(all, reel.id);

  return NextResponse.json({ reel, analysis, metricHistory, kpiDeltas, nav });
}
