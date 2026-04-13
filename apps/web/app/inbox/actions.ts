"use server";

import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";

export async function getMyChats() {
  const session = await getSession();
  if (!session) return [];

  const chats = await prisma.chat.findMany({
    where: {
      OR: [{ buyerId: session.userId }, { vendor: { userId: session.userId } }],
    },
    include: {
      listing: { include: { product: { select: { displayName: true } } } },
      buyer: { select: { name: true } },
      vendor: { select: { storeName: true, userId: true } },
      messages: { take: 1, orderBy: { createdAt: "desc" }, select: { content: true, createdAt: true, senderId: true } },
    },
    orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
  });

  return chats.map((c) => {
    const isBuyer = c.buyerId === session.userId;
    return {
      id: c.id,
      otherPartyName: isBuyer ? c.vendor.storeName : c.buyer.name,
      listingTitle: c.listing.product.displayName,
      lastMessage: c.messages[0]?.content || "No messages yet",
      lastMessageAt: c.messages[0]?.createdAt?.toISOString() || c.createdAt.toISOString(),
      isBuyer,
    };
  });
}

export async function getChatMessages(chatId: string) {
  const session = await getSession();
  if (!session) return { messages: [], chatInfo: null };

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      listing: { include: { product: { select: { displayName: true, slug: true } } } },
      buyer: { select: { id: true, name: true } },
      vendor: { select: { storeName: true, userId: true } },
      messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { name: true } } } },
    },
  });

  if (!chat) return { messages: [], chatInfo: null };

  await prisma.message.updateMany({
    where: { chatId, senderId: { not: session.userId }, isRead: false },
    data: { isRead: true },
  });

  return {
    messages: chat.messages.map((m) => ({
      id: m.id,
      content: m.content,
      senderName: m.sender.name,
      isMe: m.senderId === session.userId,
      createdAt: m.createdAt.toISOString(),
    })),
    chatInfo: {
      listingTitle: chat.listing.product.displayName,
      listingSlug: chat.listing.product.slug,
      otherPartyName: chat.buyerId === session.userId ? chat.vendor.storeName : chat.buyer.name,
    },
  };
}

export async function sendMessage(chatId: string, content: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  await prisma.message.create({
    data: { chatId, senderId: session.userId, content },
  });

  await prisma.chat.update({
    where: { id: chatId },
    data: { lastMessageAt: new Date() },
  });

  return { success: true };
}

export async function startChat(listingId: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { vendorId: true },
  });
  if (!listing) return { error: "Listing not found" };

  const existing = await prisma.chat.findFirst({
    where: { listingId, buyerId: session.userId },
  });

  if (existing) return { chatId: existing.id };

  const chat = await prisma.chat.create({
    data: { listingId, buyerId: session.userId, vendorId: listing.vendorId },
  });

  void prisma.listing.update({
    where: { id: listingId },
    data: { inquiryCount: { increment: 1 } },
  }).catch(() => {});

  return { chatId: chat.id };
}
