"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ListingCardData } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import SiteHeader from "@/components/SiteHeader";

interface SearchPageClientProps {
  query: string;
  listings: ListingCardData[];
  correctedFrom?: string | null;
}

type SortKey = "relevance" | "price-low" | "price-high" | "newest";

export default function SearchPageClient({ query, listings, correctedFrom }: SearchPageClientProps) {
  const [sortBy, setSortBy] = useState<SortKey>("relevance");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  const conditions = useMemo(() => [...new Set(listings.map((l) => l.condition))], [listings]);
  const cities = useMemo(() => [...new Set(listings.map((l) => l.location))], [listings]);

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
      <SiteHeader breadcrumbs={query ? [{ label: "Search" }] : undefined} />

      <main className="mx-auto max-w-[1140px] px-4 sm:px-6 py-5">
        {query ? (
          <>
            <h1 className="text-lg font-bold text-text-primary mb-1">
              Results for &quot;{query}&quot;
            </h1>
            {correctedFrom && (
              <p className="text-[12px] text-text-muted mb-1">
                Showing matches for the corrected spelling. Search for{" "}
                <Link
                  href={`/search?q=${encodeURIComponent(correctedFrom)}&strict=1`}
                  className="text-coral font-semibold no-underline"
                >
                  &quot;{correctedFrom}&quot;
                </Link>{" "}
                instead.
              </p>
            )}
            <p className="text-[13px] text-text-muted mb-3">{filtered.length} listings found</p>

            {listings.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="text-[12px] px-2.5 py-1.5 rounded-md border border-border bg-white text-text-primary cursor-pointer outline-none"
                >
                  <option value="relevance">Most relevant</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className="text-[12px] px-2.5 py-1.5 rounded-md border border-border bg-white text-text-primary cursor-pointer outline-none"
                >
                  <option value="all">All Conditions</option>
                  {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {cities.length > 1 && (
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="text-[12px] px-2.5 py-1.5 rounded-md border border-border bg-white text-text-primary cursor-pointer outline-none"
                  >
                    <option value="all">All Cities</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
                {(conditionFilter !== "all" || cityFilter !== "all") && (
                  <button
                    onClick={() => { setConditionFilter("all"); setCityFilter("all"); }}
                    className="text-[11px] px-2.5 py-1.5 rounded-md border border-border bg-white text-coral font-medium cursor-pointer"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
                {filtered.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm font-semibold text-text-secondary mb-1">No results found</p>
                <p className="text-xs text-text-muted mb-3">Try adjusting filters or a different search term</p>
                <Link href="/" className="text-[12px] text-coral font-semibold no-underline">
                  ← Back to homepage
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm font-semibold text-text-secondary mb-1">Search for products</p>
            <p className="text-xs text-text-muted">Try &quot;iPhone 15&quot;, &quot;MacBook&quot;, or &quot;Creta&quot;</p>
          </div>
        )}
      </main>
    </div>
  );
}
