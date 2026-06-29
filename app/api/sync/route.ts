import { NextResponse } from "next/server";
import { getRepository, getAccountRepository, getProfileRepository } from "@/lib/store";
import { getInstagramClient } from "@/lib/graph";
import { syncFromGraph } from "@/lib/graph/sync";

export async function POST() {
  try {
    const client = await getInstagramClient();
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const result = await syncFromGraph(
      client,
      getRepository(),
      getAccountRepository(),
      today,
      getProfileRepository(),
    );
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "동기화 실패";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
