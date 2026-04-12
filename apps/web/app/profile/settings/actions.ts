"use server";

import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string; email: string; city: string }) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const trimmedName = data.name.trim();
  if (!trimmedName || trimmedName.length < 2) return { error: "Name must be at least 2 characters" };
  if (trimmedName.length > 60) return { error: "Name is too long" };

  const trimmedEmail = data.email.trim().toLowerCase();
  if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { error: "Invalid email address" };
  }

  if (trimmedEmail) {
    const existing = await prisma.user.findFirst({
      where: { email: trimmedEmail, id: { not: session.userId } },
    });
    if (existing) return { error: "This email is already in use" };
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      name: trimmedName,
      email: trimmedEmail || null,
      locationCity: data.city || null,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  return { success: true };
}
