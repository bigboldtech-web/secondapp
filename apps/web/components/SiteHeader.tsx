"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SearchBar from "./SearchBar";

interface SiteHeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
  categoryId?: string | null;
}

export default function SiteHeader({ breadcrumbs, categoryId }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 5);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

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
            <div className="w-px h-5 bg-border shrink-0 hidden sm:block" />
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

        <div className="w-px h-5 bg-border shrink-0 hidden sm:block" />
        <div className="hidden sm:block flex-1 max-w-[420px]">
          <SearchBar variant="desktop" categoryId={categoryId} />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <Link href="/login" className="px-3 py-1.5 rounded-md border border-border bg-white text-xs font-medium text-icon-active no-underline hidden sm:inline">
            Log in
          </Link>
          <Link href="/vendor/listings/new" className="px-3.5 py-1.5 rounded-md border-none bg-coral text-white text-xs font-semibold no-underline">
            + Sell
          </Link>
        </div>
      </div>

      <div className="sm:hidden px-4 pb-2">
        <SearchBar variant="mobile" categoryId={categoryId} />
      </div>
    </header>
  );
}
