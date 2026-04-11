import { NextResponse } from "next/server";
import { prisma } from "@second-app/database";

export const dynamic = "force-dynamic";

// Cheap liveness probe + a real DB round-trip so uptime monitors can tell
// the difference between "Next is up" and "Next is up but Postgres is gone".
export async function GET() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        ok: true,
        service: "web",
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
        service: "web",
        db: "down",
        error: err instanceof Error ? err.message : "unknown",
        latencyMs: Date.now() - startedAt,
        now: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
