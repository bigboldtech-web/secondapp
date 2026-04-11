"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CITIES } from "@/lib/types";

interface SiteHeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
  showSearch?: boolean;
  initialQuery?: string;
}

export default function SiteHeader({ breadcrumbs, showSearch = true, initialQuery = "" }: SiteHeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 5);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border backdrop-blur-md transition-shadow ${
        scrolled ? "bg-white/97 shadow-[0_1px_4px_rgba(0,0,0,0.02)]" : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6 h-[52px] flex items-center gap-2.5">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline shrink-0">
          Second <span className="text-coral">App</span>
        </Link>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <>
            <div className="w-px h-5 bg-border shrink-0" />
            <nav className="hidden sm:flex text-[12px] text-text-muted items-center gap-1 overflow-hidden min-w-0">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1 shrink-0">
                  {i > 0 && <span>/</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-text-secondary no-underline text-text-muted">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-text-primary font-medium truncate">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </>
        )}

        {showSearch && !breadcrumbs && (
          <>
            <div className="w-px h-5 bg-border shrink-0 hidden sm:block" />
            <form onSubmit={handleSearch} className="flex-1 max-w-[480px]">
              <div className="flex items-center bg-input-light rounded-lg px-2 border-[1.5px] border-transparent transition-all focus-within:border-border focus-within:bg-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for anything..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 border-none bg-transparent py-2 px-1.5 text-[13px] text-text-primary"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} className="border-none bg-transparent cursor-pointer text-text-faint flex p-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          </>
        )}

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <Link href="/login" className="px-3 py-1.5 rounded-md border border-border bg-white text-xs font-medium cursor-pointer text-icon-active no-underline">
            Log in
          </Link>
          <Link href="/vendor/register" className="px-3.5 py-1.5 rounded-md border-none bg-coral text-white text-xs font-semibold cursor-pointer no-underline">
            + Sell
          </Link>
        </div>
      </div>
    </header>
  );
}
