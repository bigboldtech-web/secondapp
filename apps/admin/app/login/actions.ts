"use server";

import { prisma } from "@second-app/database";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";

export async function adminSendOtp(phone: string) {
  if (phone.length !== 10) return { error: "Invalid phone number" };

  const user = await prisma.user.findFirst({ where: { phone } });
  if (!user || user.role !== "admin") {
    return { error: "This phone is not registered as an admin" };
  }

  await prisma.otpVerification.deleteMany({ where: { phone } });

  const code = "123456"; // MVP: swap for SMS gateway

  await prisma.otpVerification.create({
    data: {
      phone,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  return { success: true, message: "OTP sent (dev: 123456)" };
}

export async function adminVerifyOtp(phone: string, otp: string) {
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
