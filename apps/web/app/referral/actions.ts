"use server";

import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SA";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function getOrCreateReferralCode() {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { referralCode: true, credits: true },
  });
  if (!user) return { error: "User not found" };

  if (user.referralCode) {
    return { code: user.referralCode, credits: user.credits };
  }

  let code = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const exists = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!exists) break;
    code = generateCode();
    attempts++;
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { referralCode: code },
  });

  return { code, credits: user.credits };
}

export async function applyReferralCode(code: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { error: "Enter a referral code" };

  const existing = await prisma.referral.findUnique({
    where: { referredId: session.userId },
  });
  if (existing) return { error: "You already used a referral code" };

  const referrer = await prisma.user.findUnique({
    where: { referralCode: trimmed },
    select: { id: true },
  });
  if (!referrer) return { error: "Invalid referral code" };
  if (referrer.id === session.userId) return { error: "You can't refer yourself" };

  const creditAmount = 10000;

  await prisma.referral.create({
    data: {
      referrerId: referrer.id,
      referredId: session.userId,
      referralCode: trimmed,
      creditAmount,
      status: "credited",
    },
  });

  await prisma.user.update({
    where: { id: referrer.id },
    data: { credits: { increment: creditAmount } },
  });
  await prisma.user.update({
    where: { id: session.userId },
    data: { credits: { increment: creditAmount } },
  });

  return { success: true, credited: creditAmount };
}

export async function getMyReferrals() {
  const session = await getSession();
  if (!session) return [];

  return prisma.referral.findMany({
    where: { referrerId: session.userId },
    select: {
      id: true,
      creditAmount: true,
      status: true,
      createdAt: true,
      referred: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
