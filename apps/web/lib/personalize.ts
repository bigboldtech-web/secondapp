// Simple collaborative filter: "users who viewed what you viewed also viewed X".
// Runs as a single SQL query that finds overlapping viewers, then their other
// views, ranked by frequency. No ML model — just co-occurrence in RecentlyViewed.
//
// Returns listing IDs the current user hasn't seen yet, ordered by relevance.

import { prisma } from "@second-app/database";

export async function getPersonalizedListingIds(
  userId: string,
  limit = 12
): Promise<string[]> {
  // Find listings this user has viewed.
  const myViews = await prisma.recentlyViewed.findMany({
    where: { userId },
    select: { listingId: true },
    take: 20,
    orderBy: { viewedAt: "desc" },
  });

  if (myViews.length < 2) return [];

  const myListingIds = myViews.map((v) => v.listingId);

  // Find other users who viewed any of the same listings.
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

  // Find what those users viewed that THIS user hasn't seen.
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

  // Filter to active listings only.
  const candidateIds = candidates.map((c) => c.listingId);
  if (candidateIds.length === 0) return [];

  const active = await prisma.listing.findMany({
    where: { id: { in: candidateIds }, status: "active" },
    select: { id: true },
  });
  const activeSet = new Set(active.map((l) => l.id));

  return candidateIds.filter((id) => activeSet.has(id)).slice(0, limit);
}
