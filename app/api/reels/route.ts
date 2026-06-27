import { NextResponse } from "next/server";
import { getRepository } from "@/lib/store";
import { ReelSchema } from "@/lib/schemas";
import { computeDerivedRates } from "@/lib/analysis/metrics";

export async function GET() {
  const reels = await getRepository().list();
  return NextResponse.json({ reels });
}

export async function POST(req: Request) {
  const body: unknown = await req.json();
  const parsed = ReelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const reel = { ...parsed.data, derived: computeDerivedRates(parsed.data) };
  const saved = await getRepository().upsert(reel);
  return NextResponse.json({ reel: saved });
}
