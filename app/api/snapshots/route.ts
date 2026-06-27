import { NextResponse } from "next/server";
import { getAccountRepository } from "@/lib/store";
import { AccountSnapshotSchema } from "@/lib/schemas";

export async function GET() {
  const snapshots = await getAccountRepository().list();
  return NextResponse.json({ snapshots });
}

export async function POST(req: Request) {
  const body: unknown = await req.json();
  const parsed = AccountSnapshotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const saved = await getAccountRepository().add(parsed.data);
  return NextResponse.json({ snapshot: saved });
}
