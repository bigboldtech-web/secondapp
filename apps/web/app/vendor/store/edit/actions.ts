"use server";

import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface UpdateStoreInput {
  storeName: string;
  bio: string | null;
  locationCity: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
}

export async function updateStore(input: UpdateStoreInput) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return { error: "You must register as a vendor first" };

  const trimmedName = input.storeName.trim();
  if (trimmedName.length < 2) return { error: "Store name must be at least 2 characters" };
  if (trimmedName.length > 60) return { error: "Store name is too long" };

  const bio = input.bio?.trim() ?? null;
  if (bio && bio.length > 500) return { error: "Bio must be under 500 characters" };

  const updated = await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      storeName: trimmedName,
      bio,
      locationCity: input.locationCity?.trim() || null,
      logoUrl: input.logoUrl,
      bannerUrl: input.bannerUrl,
    },
  });

  revalidatePath(`/store/${updated.storeSlug}`);
  revalidatePath("/vendor/dashboard");
  revalidatePath("/vendor/store/edit");

  return { success: true, storeSlug: updated.storeSlug };
}
