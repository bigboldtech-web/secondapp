import { NextResponse } from "next/server";
import { prisma } from "@second-app/database";
import { signToken } from "@/lib/auth";
import { rateLimitAll } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function callerIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// POST /api/public/auth/otp/verify  { phone, otp }
// Returns { token, user } — mobile stores the token and sends it as a
// Bearer header on subsequent requests. No cookie is set here since
// mobile WebView cookie behavior is unreliable across platforms.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { phone?: string; otp?: string } | null;
  const phone = body?.phone;
  const otp = body?.otp;
  if (!phone || !otp) {
    return NextResponse.json({ error: "phone and otp are required" }, { status: 400 });
  }

  const limit = rateLimitAll([
    { name: "otp-verify:phone", key: phone, max: 10, windowMs: 10 * 60 * 1000 },
    { name: "otp-verify:ip", key: callerIp(req), max: 50, windowMs: 60 * 60 * 1000 },
  ]);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many attempts. Please request a fresh OTP." }, { status: 429 });
  }

  const verification = await prisma.otpVerification.findFirst({
    where: { phone, code: otp, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!verification) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
  }

  await prisma.otpVerification.update({ where: { id: verification.id }, data: { used: true } });

  let user = await prisma.user.findFirst({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({ data: { name: "User", phone, role: "buyer" } });
  }

  const token = await signToken(user.id);

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      locationCity: user.locationCity,
    },
  });
}
