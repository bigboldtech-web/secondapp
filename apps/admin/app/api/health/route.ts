import { NextResponse } from "next/server";
import { prisma } from "@second-app/database";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        ok: true,
        service: "admin",
        db: "ok",
        latencyMs: Date.now() - startedAt,
        now: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        service: "admin",
        db: "down",
        error: err instanceof Error ? err.message : "unknown",
        latencyMs: Date.now() - startedAt,
        now: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
