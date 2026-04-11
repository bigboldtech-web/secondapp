import { NextResponse } from "next/server";
import { prisma } from "@second-app/database";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/public/auth/me   Authorization: Bearer <jwt>
// Lets the mobile client verify a stored token is still valid after app
// restart and rehydrate the user profile without re-running OTP.
export async function GET(req: Request) {
  const authz = req.headers.get("authorization") || "";
  const match = authz.match(/^Bearer\s+(.+)$/i);
  if (!match) return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });

  const payload = await verifyToken(match[1]);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, phone: true, email: true, role: true, locationCity: true, isActive: true },
  });
  if (!user || !user.isActive) return NextResponse.json({ error: "User disabled" }, { status: 401 });

  return NextResponse.json({ user });
}
