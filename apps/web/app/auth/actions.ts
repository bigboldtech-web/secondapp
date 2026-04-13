"use server";

import { headers } from "next/headers";
import { prisma } from "@second-app/database";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { sendSms, generateOtp, isDevOtpMode } from "@/lib/notifications";
import { rateLimitAll } from "@/lib/rate-limit";
import { emailWelcome } from "@/lib/email-templates";

async function callerIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

export async function sendOtp(phone: string) {
  if (phone.length !== 10) return { error: "Invalid phone number" };

  const ip = await callerIp();
  const limit = rateLimitAll([
    { name: "otp:phone", key: phone, max: 3, windowMs: 10 * 60 * 1000 },
    { name: "otp:ip", key: ip, max: 15, windowMs: 60 * 60 * 1000 },
  ]);
  if (!limit.ok) {
    return { error: `Too many attempts. Try again in ${Math.ceil(limit.resetInSeconds / 60)} min.` };
  }

  await prisma.otpVerification.deleteMany({ where: { phone } });

  const code = generateOtp();

  await prisma.otpVerification.create({
    data: {
      phone,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const delivery = await sendSms({
    to: phone,
    message: `Your Second App verification code is ${code}. Valid for 10 minutes.`,
  });

  if (!delivery.ok) {
    return { error: "Couldn't send SMS right now — please try again in a moment" };
  }

  return {
    success: true,
    message: isDevOtpMode() ? "OTP printed to server console (dev mode)" : "OTP sent",
    devMode: isDevOtpMode(),
  };
}

export async function verifyOtp(phone: string, otp: string) {
  const ip = await callerIp();
  const limit = rateLimitAll([
    { name: "otp-verify:phone", key: phone, max: 10, windowMs: 10 * 60 * 1000 },
    { name: "otp-verify:ip", key: ip, max: 50, windowMs: 60 * 60 * 1000 },
  ]);
  if (!limit.ok) {
    return { error: "Too many attempts. Please request a fresh OTP." };
  }

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

  await prisma.otpVerification.update({
    where: { id: verification.id },
    data: { used: true },
  });

  let user = await prisma.user.findFirst({ where: { phone } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "User",
        phone,
        role: "buyer",
      },
    });
  }

  await setSessionCookie(user.id);

  return { success: true, userId: user.id, isNewUser: user.name === "User" };
}

export async function registerUser(data: { name: string; phone: string; email?: string; city?: string }) {
  if (!data.name.trim() || data.phone.length !== 10) return { error: "Name and phone are required" };

  const existing = await prisma.user.findFirst({ where: { phone: data.phone } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { name: data.name, email: data.email || undefined, locationCity: data.city || undefined },
    });
    await setSessionCookie(existing.id);
    return { success: true, userId: existing.id };
  }

  const user = await prisma.user.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      locationCity: data.city || null,
      role: "buyer",
    },
  });

  await setSessionCookie(user.id);
  if (data.email) void emailWelcome({ email: data.email, name: data.name });
  return { success: true, userId: user.id };
}

export async function registerVendor(data: {
  name: string;
  phone: string;
  email: string;
  storeName: string;
  storeCity: string;
  bio?: string;
}) {
  let user = await prisma.user.findFirst({ where: { phone: data.phone } });

  if (!user) {
    user = await prisma.user.create({
      data: { name: data.name, phone: data.phone, email: data.email, role: "vendor" },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "vendor", name: data.name, email: data.email },
    });
  }

  const storeSlug = data.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const existingVendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
  if (!existingVendor) {
    await prisma.vendor.create({
      data: {
        userId: user.id,
        storeName: data.storeName,
        storeSlug: storeSlug + "-" + Date.now().toString().slice(-4),
        bio: data.bio || null,
        locationCity: data.storeCity,
        kycStatus: "pending",
        certificationLevel: "unverified",
      },
    });
  }

  await setSessionCookie(user.id);
  return { success: true };
}

export async function logout() {
  await clearSessionCookie();
  return { success: true };
}
