import Link from "next/link";
import { getMyNotifications, markAllAsRead } from "./actions";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const notifications = await getMyNotifications();
  return <NotificationsClient notifications={notifications} />;
}
