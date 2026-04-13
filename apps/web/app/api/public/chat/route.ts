import { NextResponse } from "next/server";
import { prisma } from "@second-app/database";
import { verifyToken } from "@/lib/auth";

function extractUserId(req: Request): string | null {
  const authz = req.headers.get("authorization") || "";
  const match = authz.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  return null;
}

async function getUserId(req: Request): Promise<string | null> {
  const authz = req.headers.get("authorization") || "";
  const match = authz.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const payload = await verifyToken(match[1]);
  return payload?.userId ?? null;
}

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const chats = await prisma.chat.findMany({
    where: {
      OR: [{ buyerId: userId }, { vendor: { userId } }],
    },
    include: {
      listing: { include: { product: { select: { displayName: true } } } },
      buyer: { select: { name: true } },
      vendor: { select: { storeName: true, userId: true } },
      messages: { take: 1, orderBy: { createdAt: "desc" }, select: { content: true, createdAt: true, senderId: true } },
    },
    orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
  });

  return NextResponse.json({
    chats: chats.map((c) => {
      const isBuyer = c.buyerId === userId;
      return {
        id: c.id,
        otherPartyName: isBuyer ? c.vendor.storeName : c.buyer.name,
        listingTitle: c.listing.product.displayName,
        lastMessage: c.messages[0]?.content || "No messages yet",
        lastMessageAt: c.messages[0]?.createdAt?.toISOString() || c.createdAt.toISOString(),
        isBuyer,
      };
    }),
  });
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await req.json()) as { chatId?: string; listingId?: string; content?: string };

  if (body.listingId && !body.chatId) {
    const listing = await prisma.listing.findUnique({ where: { id: body.listingId }, select: { vendorId: true } });
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    const existing = await prisma.chat.findFirst({ where: { listingId: body.listingId, buyerId: userId } });
    if (existing) return NextResponse.json({ chatId: existing.id });

    const chat = await prisma.chat.create({ data: { listingId: body.listingId, buyerId: userId, vendorId: listing.vendorId } });
    return NextResponse.json({ chatId: chat.id });
  }

  if (body.chatId && body.content) {
    await prisma.message.create({ data: { chatId: body.chatId, senderId: userId, content: body.content } });
    await prisma.chat.update({ where: { id: body.chatId }, data: { lastMessageAt: new Date() } });

    const messages = await prisma.message.findMany({
      where: { chatId: body.chatId },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { name: true } } },
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        senderName: m.sender.name,
        isMe: m.senderId === userId,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
