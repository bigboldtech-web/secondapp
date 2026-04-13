import { NextResponse } from "next/server";
import { prisma } from "@second-app/database";
import { verifyToken } from "@/lib/auth";

async function getUserId(req: Request): Promise<string | null> {
  const authz = req.headers.get("authorization") || "";
  const match = authz.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const payload = await verifyToken(match[1]);
  return payload?.userId ?? null;
}

export async function GET(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { chatId } = await params;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      listing: { include: { product: { select: { displayName: true, slug: true } } } },
      buyer: { select: { id: true, name: true } },
      vendor: { select: { storeName: true, userId: true } },
      messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { name: true } } } },
    },
  });

  if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

  await prisma.message.updateMany({
    where: { chatId, senderId: { not: userId }, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({
    chatInfo: {
      listingTitle: chat.listing.product.displayName,
      listingSlug: chat.listing.product.slug,
      otherPartyName: chat.buyerId === userId ? chat.vendor.storeName : chat.buyer.name,
    },
    messages: chat.messages.map((m) => ({
      id: m.id,
      content: m.content,
      senderName: m.sender.name,
      isMe: m.senderId === userId,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}
