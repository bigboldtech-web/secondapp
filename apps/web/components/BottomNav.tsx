"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { id: "home", label: "Home", href: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
  { id: "search", label: "Explore", href: "/search", icon: "M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" },
  { id: "sell", label: "Sell", href: "/vendor/listings/new", icon: "M12 5v14M5 12h14" },
  { id: "inbox", label: "Inbox", href: "/inbox", icon: "M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { id: "me", label: "Me", href: "/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex z-[200] pb-[env(safe-area-inset-bottom)] sm:hidden">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="flex-1 flex flex-col items-center gap-0.5 pt-2 pb-1.5 no-underline"
        >
          {item.id === "sell" ? (
            <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center -mt-4 shadow-[0_2px_8px_rgba(232,85,61,0.25)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d={item.icon} />
              </svg>
            </div>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isActive(item.href) ? "#E8553D" : "#999"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
          )}
          <span className={`text-[10px] ${item.id === "sell" || isActive(item.href) ? "text-coral font-semibold" : "text-text-secondary font-normal"}`}>
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
