import { NextResponse } from "next/server";
import { z } from "zod";
import { parseScreenshot } from "@/lib/parsing/screenshot";
import { getVisionModel } from "@/lib/llm";

const BodySchema = z.object({
  imageBase64: z.string().min(1),
  mediaType: z.enum(["image/png", "image/jpeg", "image/webp"]),
});

export async function POST(req: Request) {
  const body: unknown = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const model = await getVisionModel();
    const result = await parseScreenshot(parsed.data.imageBase64, parsed.data.mediaType, model);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "파싱 실패";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
