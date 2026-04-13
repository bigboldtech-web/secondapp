"use server";

import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getMyNotifications() {
  const session = await getSession();
  if (!session) return [];

  const notifs = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return notifs.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    isRead: n.isRead,
    link: n.data ? JSON.parse(n.data).link : null,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function markAsRead(notifId: string) {
  const session = await getSession();
  if (!session) return;

  await prisma.notification.updateMany({
    where: { id: notifId, userId: session.userId },
    data: { isRead: true },
  });
  revalidatePath("/notifications");
}

export async function markAllAsRead() {
  const session = await getSession();
  if (!session) return;
  await prisma.notification.updateMany({ where: { userId: session.userId, isRead: false }, data: { isRead: true } });
  revalidatePath("/notifications");
}

export async function getUnreadCount() {
  const session = await getSession();
  if (!session) return 0;
  return prisma.notification.count({ where: { userId: session.userId, isRead: false } });
}
