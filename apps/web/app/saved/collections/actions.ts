"use server";

import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createCollection(name: string, isPublic = false) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 1) return { error: "Name is required" };
  if (trimmed.length > 50) return { error: "Name must be under 50 characters" };

  const collection = await prisma.collection.create({
    data: { userId: session.userId, name: trimmed, isPublic },
  });

  revalidatePath("/saved");
  return { success: true, collectionId: collection.id };
}

export async function addToCollection(collectionId: string, listingId: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
  if (!collection || collection.userId !== session.userId) return { error: "Collection not found" };

  const existing = await prisma.collectionItem.findFirst({
    where: { collectionId, listingId },
  });
  if (existing) return { success: true };

  await prisma.collectionItem.create({ data: { collectionId, listingId } });
  revalidatePath("/saved");
  return { success: true };
}

export async function removeFromCollection(collectionId: string, listingId: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
  if (!collection || collection.userId !== session.userId) return { error: "Collection not found" };

  await prisma.collectionItem.deleteMany({ where: { collectionId, listingId } });
  revalidatePath("/saved");
  return { success: true };
}

export async function deleteCollection(collectionId: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
  if (!collection || collection.userId !== session.userId) return { error: "Collection not found" };
  if (collection.name === "Saved Items") return { error: "Cannot delete the default collection" };

  await prisma.collectionItem.deleteMany({ where: { collectionId } });
  await prisma.collection.delete({ where: { id: collectionId } });
  revalidatePath("/saved");
  return { success: true };
}

export async function getMyCollections() {
  const session = await getSession();
  if (!session) return [];

  const collections = await prisma.collection.findMany({
    where: { userId: session.userId },
    include: {
      _count: { select: { items: true } },
      items: {
        take: 4,
        orderBy: { addedAt: "desc" },
        include: {
          listing: {
            select: { photos: true, product: { select: { displayName: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return collections.map((c) => ({
    id: c.id,
    name: c.name,
    isPublic: c.isPublic,
    itemCount: c._count.items,
    previews: c.items.map((item) => {
      let thumb: string | null = null;
      try {
        if (item.listing.photos) {
          const p = JSON.parse(item.listing.photos);
          if (Array.isArray(p) && p.length > 0) thumb = p[0];
        }
      } catch { /* */ }
      return { title: item.listing.product.displayName, thumbnail: thumb };
    }),
  }));
}
