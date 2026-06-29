import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/store";
import { parseScreenshot } from "@/lib/parsing/screenshot";
import { mergeScreenshotParse } from "@/lib/parsing/mergeScreenshot";
import { computeDerivedRates } from "@/lib/analysis/metrics";
import { getVisionModel } from "@/lib/llm";

const BodySchema = z.object({
  imageBase64: z.string().min(1),
  mediaType: z.enum(["image/png", "image/jpeg", "image/webp"]),
  imageType: z.enum(["edit", "audience", "watchTime"]).default("edit"),
});

// EDIT/팔로워/시청지속 스크린샷 → Vision 파싱 → 해당 릴스에 병합 저장 (모바일 QR 업로드 대상)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body: unknown = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const repo = getRepository();
  const reel = await repo.get(id);
  if (!reel) return NextResponse.json({ error: "릴스를 찾을 수 없습니다" }, { status: 404 });

  try {
    const model = await getVisionModel();
    const result = await parseScreenshot(parsed.data.imageBase64, parsed.data.mediaType, model, parsed.data.imageType);
    const merged = mergeScreenshotParse(reel, result);
    const saved = await repo.upsert({ ...merged, derived: computeDerivedRates(merged) });
    return NextResponse.json({ reel: saved, parsed: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "파싱 실패";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
