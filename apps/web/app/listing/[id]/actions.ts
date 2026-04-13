"use server";

import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";

const VALID_REASONS = new Set(["spam", "fake", "offensive", "wrong_price", "other"]);

export async function reportListing(listingId: string, reason: string, details?: string) {
  const session = await getSession();
  if (!session) return { error: "Please log in to report a listing" };

  if (!VALID_REASONS.has(reason)) return { error: "Invalid reason" };

  const existing = await prisma.listingReport.findUnique({
    where: { listingId_userId: { listingId, userId: session.userId } },
  });
  if (existing) return { error: "You already reported this listing" };

  await prisma.listingReport.create({
    data: {
      listingId,
      userId: session.userId,
      reason,
      details: details?.slice(0, 500) || null,
    },
  });

  return { success: true };
}

// ---- Reactions ----

export type ReactionData = Record<string, number>;
export type CommentData = { id: string; userName: string; comment: string; timeAgo: string };

const VALID_REACTION_TYPES = new Set(["like", "helpful", "great_price"]);

export async function toggleReaction(listingId: string, type: string) {
  const session = await getSession();
  if (!session) return { error: "Login required" };
  if (!VALID_REACTION_TYPES.has(type)) return { error: "Invalid reaction" };

  const existing = await prisma.listingReaction.findUnique({
    where: { listingId_userId_type: { listingId, userId: session.userId, type } },
  });

  if (existing) {
    await prisma.listingReaction.delete({ where: { id: existing.id } });
    return { removed: true };
  }

  await prisma.listingReaction.create({
    data: { listingId, userId: session.userId, type },
  });
  return { added: true };
}

export async function addComment(listingId: string, comment: string) {
  const session = await getSession();
  if (!session) return { error: "Login required" };

  const trimmed = comment.trim().slice(0, 300);
  if (!trimmed) return { error: "Comment is empty" };

  await prisma.listingComment.create({
    data: { listingId, userId: session.userId, comment: trimmed },
  });
  return { success: true };
}

export async function getReactionsAndComments(listingId: string) {
  const [reactions, comments] = await Promise.all([
    prisma.listingReaction.groupBy({
      by: ["type"],
      where: { listingId },
      _count: { type: true },
    }),
    prisma.listingComment.findMany({
      where: { listingId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const reactionCounts: ReactionData = {};
  for (const r of reactions) reactionCounts[r.type] = r._count.type;

  const now = Date.now();
  const commentData: CommentData[] = comments.map((c) => {
    const diffMs = now - c.createdAt.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    const timeAgo = days > 0 ? `${days}d` : hours > 0 ? `${hours}h` : mins > 0 ? `${mins}m` : "now";
    return { id: c.id, userName: c.user.name, comment: c.comment, timeAgo };
  });

  return { reactions: reactionCounts, comments: commentData };
}
