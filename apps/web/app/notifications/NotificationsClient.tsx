"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { markAsRead, markAllAsRead } from "./actions";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  order: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  chat: "M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  alert: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  system: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  promotion: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4",
};

export default function NotificationsClient({ notifications }: { notifications: Notification[] }) {
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6 h-[52px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline shrink-0">Second <span className="text-coral">App</span></Link>
            <div className="w-px h-5 bg-border" />
            <span className="text-[12px] font-medium text-text-muted">Notifications</span>
          </div>
          {unreadCount > 0 && (
            <button onClick={async () => { await markAllAsRead(); router.refresh(); }} className="text-[11px] text-coral font-semibold bg-transparent border-none cursor-pointer">
              Mark all read
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[800px] px-4 sm:px-6 py-6">
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={async () => {
                  if (!notif.isRead) { await markAsRead(notif.id); router.refresh(); }
                  if (notif.link) router.push(notif.link);
                }}
                className={`bg-card border rounded-[10px] px-4 py-3 cursor-pointer transition-shadow hover:shadow-sm ${notif.isRead ? "border-border" : "border-coral-border bg-coral-light/30"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.isRead ? "bg-input" : "bg-coral-light"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={notif.isRead ? "#999" : "#E8553D"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={TYPE_ICONS[notif.type] || TYPE_ICONS.system} />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[13px] ${notif.isRead ? "text-text-secondary" : "text-text-primary font-semibold"}`}>{notif.title}</p>
                    {notif.body && <p className="text-[11px] text-text-muted mt-0.5 truncate">{notif.body}</p>}
                    <p className="text-[10px] text-text-faint mt-1">{new Date(notif.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  {!notif.isRead && <div className="w-2 h-2 rounded-full bg-coral shrink-0 mt-2" />}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm font-semibold text-text-secondary mb-1">No notifications</p>
            <p className="text-[13px] text-text-muted">You&apos;re all caught up!</p>
          </div>
        )}
      </main>
    </div>
  );
}
