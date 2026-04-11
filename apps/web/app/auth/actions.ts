"use server";

import { prisma } from "@second-app/database";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";

export async function sendOtp(phone: string) {
  if (phone.length !== 10) return { error: "Invalid phone number" };

  // Delete any existing OTPs for this phone
  await prisma.otpVerification.deleteMany({ where: { phone } });

  // For MVP: hardcoded OTP. In production: integrate SMS gateway (MSG91, Twilio, etc.)
  const code = "123456";

  await prisma.otpVerification.create({
    data: {
      phone,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
    },
  });

  return { success: true, message: "OTP sent (dev: 123456)" };
}

export async function verifyOtp(phone: string, otp: string) {
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

  // Mark as used
  await prisma.otpVerification.update({
    where: { id: verification.id },
    data: { used: true },
  });

  // Find or create user
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

  // Check if phone already exists
  const existing = await prisma.user.findFirst({ where: { phone: data.phone } });
  if (existing) {
    // Update and login
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
  // Create user
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

  // Create vendor profile
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
