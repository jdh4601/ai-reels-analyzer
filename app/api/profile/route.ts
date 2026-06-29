import { NextResponse } from "next/server";
import { getProfileRepository } from "@/lib/store";

export async function GET() {
  const profile = await getProfileRepository().get();
  return NextResponse.json({ profile });
}
