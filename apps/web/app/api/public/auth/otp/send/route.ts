import { NextResponse } from "next/server";
import { prisma } from "@second-app/database";
import { sendSms, generateOtp, isDevOtpMode } from "@/lib/notifications";
import { rateLimitAll } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function callerIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { phone?: string } | null;
  const phone = body?.phone;
  if (!phone || phone.length !== 10) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  const limit = rateLimitAll([
    { name: "otp:phone", key: phone, max: 3, windowMs: 10 * 60 * 1000 },
    { name: "otp:ip", key: callerIp(req), max: 15, windowMs: 60 * 60 * 1000 },
  ]);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil(limit.resetInSeconds / 60)} min.` },
      { status: 429 }
    );
  }

  await prisma.otpVerification.deleteMany({ where: { phone } });

  const code = generateOtp();
  await prisma.otpVerification.create({
    data: { phone, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
  });

  const delivered = await sendSms({
    to: phone,
    message: `Your Second App verification code is ${code}. Valid for 10 minutes.`,
  });

  if (!delivered.ok) {
    return NextResponse.json({ error: "Couldn't send SMS right now" }, { status: 502 });
  }

  return NextResponse.json({
    success: true,
    devMode: isDevOtpMode(),
  });
}
