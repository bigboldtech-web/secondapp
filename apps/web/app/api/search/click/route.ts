import { NextResponse } from "next/server";
import { recordClick, recordHit } from "@/lib/search";

export const dynamic = "force-dynamic";

// Two shapes:
//   { termId }                       — the user picked a suggestion but didn't click a listing yet
//   { termId?, listingId, queryLogId? } — the user clicked a listing out of a search
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.listingId) {
      await recordClick({
        termId: body.termId ?? null,
        listingId: body.listingId,
        queryLogId: body.queryLogId ?? null,
      });
    } else if (body.termId) {
      await recordHit(body.termId);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
