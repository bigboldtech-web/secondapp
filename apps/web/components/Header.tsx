"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CategoryWithCount, CITIES, CATEGORY_ICONS } from "@/lib/types";
import SearchBar from "./SearchBar";

interface HeaderProps {
  city: string;
  setCity: (c: string) => void;
  categories: CategoryWithCount[];
  activeCategory?: string | null;
  isLoggedIn?: boolean;
  userName?: string;
}

export default function Header({ city, setCity, categories, activeCategory, isLoggedIn, userName }: HeaderProps) {
  const [cityOpen, setCityOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const desktopCityRef = useRef<HTMLDivElement>(null);
  const mobileCityRef = useRef<HTMLDivElement>(null);

  const activeCategoryId = categories.find((c) => c.slug === activeCategory)?.id ?? null;

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 5);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = desktopCityRef.current?.contains(target);
      const insideMobile = mobileCityRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) setCityOpen(false);
    };
    if (cityOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [cityOpen]);

  const allIcon = "M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z";

  return (
    <header className={`sticky top-0 z-50 border-b border-border backdrop-blur-md transition-shadow ${scrolled ? "bg-white/97 shadow-[0_1px_4px_rgba(0,0,0,0.02)]" : "bg-white"}`}>
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-2.5 h-[52px]">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline shrink-0">
            Second <span className="text-coral">App</span>
          </Link>
          <div className="w-px h-5 bg-border shrink-0" />

          {/* City picker */}
          <div className="relative shrink-0" ref={desktopCityRef}>
            <button onClick={() => setCityOpen(!cityOpen)} className="flex items-center gap-1 px-2 py-1.5 rounded-md border border-border bg-white text-xs font-medium text-icon-active cursor-pointer">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              {city}
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="3"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {cityOpen && (
              <div className="absolute top-[calc(100%+4px)] left-0 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-border overflow-hidden z-50 min-w-[160px]">
                {CITIES.map((c) => (
                  <div key={c} onClick={() => { setCity(c); setCityOpen(false); }} className={`px-3.5 py-2 text-[13px] cursor-pointer ${c === city ? "text-coral font-semibold bg-coral-light" : "text-icon-active hover:bg-bg"}`}>
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <SearchBar variant="desktop" categoryId={activeCategoryId} />

          {/* Auth */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isLoggedIn ? (
              <Link href="/profile" className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-bg no-underline">
                <div className="w-7 h-7 rounded-full bg-coral-light flex items-center justify-center text-[11px] font-bold text-coral">
                  {(userName || "U").charAt(0)}
                </div>
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-3 py-1.5 rounded-md border border-border bg-white text-xs font-medium text-icon-active no-underline">Log in</Link>
                <Link href="/vendor/listings/new" className="px-3.5 py-1.5 rounded-md border-none bg-coral text-white text-xs font-semibold no-underline">+ Sell</Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="flex sm:hidden items-center gap-2 h-12">
          <Link href="/" className="text-base font-extrabold tracking-tight shrink-0 no-underline text-text-primary">
            Second <span className="text-coral">App</span>
          </Link>
          <SearchBar variant="mobile" categoryId={activeCategoryId} />
          <div className="relative shrink-0" ref={mobileCityRef}>
            <button onClick={() => setCityOpen(!cityOpen)} className="flex items-center gap-0.5 px-1.5 py-1 border-none bg-transparent cursor-pointer text-[11px] text-text-secondary">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              {city === "All India" ? "India" : city}
            </button>
            {cityOpen && (
              <div className="absolute top-[calc(100%+4px)] right-0 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-border overflow-hidden z-50 min-w-[160px]">
                {CITIES.map((c) => (
                  <div key={c} onClick={() => { setCity(c); setCityOpen(false); }} className={`px-3.5 py-2 text-[13px] cursor-pointer ${c === city ? "text-coral font-semibold bg-coral-light" : "text-icon-active hover:bg-bg"}`}>
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category pills — now links */}
        <div className="flex gap-0.5 overflow-x-auto scrollbar-hide pb-1.5">
          <Link href="/" className={`flex flex-col items-center gap-[3px] px-2.5 py-1.5 rounded-lg border-[1.5px] transition-all min-w-[52px] shrink-0 no-underline ${!activeCategory ? "bg-coral-light border-coral-border" : "bg-transparent border-transparent hover:bg-[#f3f3f3]"}`}>
            <div className={`w-7 h-7 rounded-md flex items-center justify-center ${!activeCategory ? "bg-coral-light" : "bg-input"}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={!activeCategory ? "#E8553D" : "#bbb"}><path d={allIcon} /></svg>
            </div>
            <span className={`text-[10px] whitespace-nowrap ${!activeCategory ? "text-coral font-semibold" : "text-text-secondary font-medium"}`}>All</span>
          </Link>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            const iconPath = CATEGORY_ICONS[cat.slug] || allIcon;
            return (
              <Link key={cat.id} href={`/category/${cat.slug}`} className={`flex flex-col items-center gap-[3px] px-2.5 py-1.5 rounded-lg border-[1.5px] transition-all min-w-[52px] shrink-0 no-underline ${isActive ? "bg-coral-light border-coral-border" : "bg-transparent border-transparent hover:bg-[#f3f3f3]"}`}>
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${isActive ? "bg-coral-light" : "bg-input"}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={isActive ? "#E8553D" : "#bbb"}><path d={iconPath} /></svg>
                </div>
                <span className={`text-[10px] whitespace-nowrap ${isActive ? "text-coral font-semibold" : "text-text-secondary font-medium"}`}>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
