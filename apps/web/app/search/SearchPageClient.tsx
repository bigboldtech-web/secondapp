"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListingCardData } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

interface SearchPageClientProps {
  query: string;
  listings: ListingCardData[];
}

export default function SearchPageClient({ query, listings }: SearchPageClientProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline shrink-0">
            Second <span className="text-coral">App</span>
          </Link>
          <div className="w-px h-5 bg-border shrink-0" />
          <form onSubmit={handleSearch} className="flex-1 max-w-[480px]">
            <div className="flex items-center bg-input-light rounded-lg px-2 border-[1.5px] border-transparent focus-within:border-border focus-within:bg-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search for anything..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 border-none bg-transparent py-2 px-1.5 text-[13px] text-text-primary"
                autoFocus
              />
            </div>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-[1140px] px-4 sm:px-6 py-5">
        {query ? (
          <>
            <h1 className="text-lg font-bold text-text-primary mb-1">
              Results for &quot;{query}&quot;
            </h1>
            <p className="text-[13px] text-text-muted mb-4">{listings.length} listings found</p>

            {listings.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
                {listings.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm font-semibold text-text-secondary mb-1">No results found</p>
                <p className="text-xs text-text-muted mb-3">Try a different search term</p>
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
