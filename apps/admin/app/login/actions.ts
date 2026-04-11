"use server";

import { headers } from "next/headers";
import { prisma } from "@second-app/database";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { rateLimitAll } from "@/lib/rate-limit";

async function callerIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

// Admin login shares the same SMS gateway and OTP generator as the web app.
// We import from apps/web via a relative path so provider env is resolved
// the same way in both Next.js processes.
async function generateOtp(): Promise<string> {
  if (process.env.DEV_OTP) return process.env.DEV_OTP;
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function deliverSms(phone: string, message: string): Promise<boolean> {
  if (!process.env.MSG91_AUTH_KEY) {
    console.log(`[admin sms:console] to=${phone}\n${message}`);
    return true;
  }
  try {
    const res = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: { authkey: process.env.MSG91_AUTH_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        template_id: process.env.MSG91_TEMPLATE_ID,
        sender: process.env.MSG91_SENDER_ID || "SECAPP",
        short_url: "0",
        recipients: [{
          mobiles: phone.replace(/\D/g, "").length === 10 ? `91${phone}` : phone.replace(/\D/g, ""),
          message,
        }],
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminSendOtp(phone: string) {
  if (phone.length !== 10) return { error: "Invalid phone number" };

  const ip = await callerIp();
  const limit = rateLimitAll([
    { name: "admin-otp:phone", key: phone, max: 3, windowMs: 10 * 60 * 1000 },
    { name: "admin-otp:ip", key: ip, max: 10, windowMs: 60 * 60 * 1000 },
  ]);
  if (!limit.ok) {
    return { error: `Too many attempts. Try again in ${Math.ceil(limit.resetInSeconds / 60)} min.` };
  }

  const user = await prisma.user.findFirst({ where: { phone } });
  if (!user || user.role !== "admin") {
    return { error: "This phone is not registered as an admin" };
  }

  await prisma.otpVerification.deleteMany({ where: { phone } });

  const code = await generateOtp();

  await prisma.otpVerification.create({
    data: {
      phone,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const sent = await deliverSms(phone, `Your Second App admin code is ${code}. Valid for 10 minutes.`);
  if (!sent) return { error: "Could not send SMS. Check logs and try again." };

  const devMode = !process.env.MSG91_AUTH_KEY;
  return { success: true, message: devMode ? "OTP printed to server console (dev mode)" : "OTP sent", devMode };
}

export async function adminVerifyOtp(phone: string, otp: string) {
  const ip = await callerIp();
  const limit = rateLimitAll([
    { name: "admin-otp-verify:phone", key: phone, max: 10, windowMs: 10 * 60 * 1000 },
    { name: "admin-otp-verify:ip", key: ip, max: 30, windowMs: 60 * 60 * 1000 },
  ]);
  if (!limit.ok) return { error: "Too many attempts. Please request a fresh OTP." };

  const verification = await prisma.otpVerification.findFirst({
    where: {
      phone,
      code: otp,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!verification) return { error: "Invalid or expired OTP" };

  const user = await prisma.user.findFirst({ where: { phone } });
  if (!user || user.role !== "admin") {
    return { error: "Not authorized" };
  }

  await prisma.otpVerification.update({
    where: { id: verification.id },
    data: { used: true },
  });

  await setSessionCookie(user.id);
  return { success: true };
}

export async function adminLogout() {
  await clearSessionCookie();
  return { success: true };
}
