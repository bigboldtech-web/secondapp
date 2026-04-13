import { prisma } from "@second-app/database";

export async function getPersonalizedListingIds(
  userId: string,
  limit = 12
): Promise<string[]> {
  const myViews = await prisma.recentlyViewed.findMany({
    where: { userId },
    select: { listingId: true },
    take: 20,
    orderBy: { viewedAt: "desc" },
  });

  if (myViews.length < 2) return [];

  const myListingIds = myViews.map((v) => v.listingId);

  const similarUsers = await prisma.recentlyViewed.findMany({
    where: {
      listingId: { in: myListingIds },
      userId: { not: userId },
    },
    select: { userId: true },
    distinct: ["userId"],
    take: 50,
  });

  if (similarUsers.length === 0) return [];

  const similarUserIds = similarUsers.map((u) => u.userId);

  const candidates = await prisma.recentlyViewed.groupBy({
    by: ["listingId"],
    where: {
      userId: { in: similarUserIds },
      listingId: { notIn: myListingIds },
    },
    _count: { listingId: true },
    orderBy: { _count: { listingId: "desc" } },
    take: limit * 2,
  });

  const candidateIds = candidates.map((c) => c.listingId);
  if (candidateIds.length === 0) return [];

  const active = await prisma.listing.findMany({
    where: { id: { in: candidateIds }, status: "active" },
    select: { id: true },
  });
  const activeSet = new Set(active.map((l) => l.id));

  return candidateIds.filter((id) => activeSet.has(id)).slice(0, limit);
}
