"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUnreadCount } from "@/app/notifications/actions";
import { t, getLocaleFromCookie, type Locale } from "@/lib/i18n";

export default function BottomNav() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const cookie = document.cookie.split("; ").find((c) => c.startsWith("sa_locale="))?.split("=")[1];
    setLocale(getLocaleFromCookie(cookie));
  }, []);

  useEffect(() => {
    getUnreadCount().then((c) => setUnread(c)).catch(() => {});
    const interval = setInterval(() => {
      getUnreadCount().then((c) => setUnread(c)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const items = [
    { id: "home", label: t("nav.home", locale), href: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
    { id: "search", label: t("nav.explore", locale), href: "/search", icon: "M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" },
    { id: "sell", label: t("nav.sell", locale), href: "/vendor/listings/new", icon: "M12 5v14M5 12h14" },
    { id: "inbox", label: t("nav.inbox", locale), href: "/inbox", icon: "M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
    { id: "me", label: t("nav.me", locale), href: "/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex z-[200] pb-[env(safe-area-inset-bottom)] sm:hidden">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="flex-1 flex flex-col items-center gap-0.5 pt-2 pb-1.5 no-underline relative"
        >
          {item.id === "sell" ? (
            <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center -mt-4 shadow-[0_2px_8px_rgba(232,85,61,0.25)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d={item.icon} />
              </svg>
            </div>
          ) : (
            <div className="relative">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isActive(item.href) ? "#E8553D" : "#999"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.id === "inbox" && unread > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-coral text-white text-[8px] font-bold flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </div>
          )}
          <span className={`text-[10px] ${item.id === "sell" || isActive(item.href) ? "text-coral font-semibold" : "text-text-secondary font-normal"}`}>
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
