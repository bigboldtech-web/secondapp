"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ListingCardData } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

interface CategoryPageClientProps {
  category: { id: string; name: string; slug: string };
  listings: ListingCardData[];
}

export default function CategoryPageClient({ category, listings }: CategoryPageClientProps) {
  const [sortBy, setSortBy] = useState("featured");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const conditions = [...new Set(listings.map((l) => l.condition))];
  const cities = [...new Set(listings.map((l) => l.location))];

  const filtered = useMemo(() => {
    let result = [...listings];

    if (conditionFilter !== "all") result = result.filter((l) => l.condition === conditionFilter);
    if (cityFilter !== "all") result = result.filter((l) => l.location === cityFilter);

    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    }

    return result;
  }, [listings, conditionFilter, cityFilter, sortBy]);

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline shrink-0">
            Second <span className="text-coral">App</span>
          </Link>
          <div className="w-px h-5 bg-border" />
          <nav className="text-[12px] text-text-muted flex items-center gap-1">
            <Link href="/" className="hover:text-text-secondary no-underline text-text-muted">Home</Link>
            <span>/</span>
            <span className="text-text-primary font-medium">{category.name}</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1140px] px-4 sm:px-6 py-5">
        <h1 className="text-xl font-bold text-text-primary mb-1">{category.name}</h1>
        <p className="text-[13px] text-text-muted mb-4">{filtered.length} listings</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-[12px] px-2.5 py-1.5 rounded-md border border-border bg-white text-text-primary cursor-pointer">
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
          <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} className="text-[12px] px-2.5 py-1.5 rounded-md border border-border bg-white text-text-primary cursor-pointer">
            <option value="all">All Conditions</option>
            {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {cities.length > 1 && (
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="text-[12px] px-2.5 py-1.5 rounded-md border border-border bg-white text-text-primary cursor-pointer">
              <option value="all">All Cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {filtered.map((item) => (
              <ProductCard key={item.id} item={item} compact={isMobile} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-faint">
            <p className="text-sm font-semibold text-text-secondary mb-1">No listings found</p>
            <button
              onClick={() => { setConditionFilter("all"); setCityFilter("all"); }}
              className="px-4 py-1.5 mt-2 rounded-md border-none bg-text-primary text-white text-[11px] font-semibold cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
