"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ProductDetail, ProductListingData, CONDITION_COLORS, CATEGORY_ICONS } from "@/lib/types";
import { formatPrice, formatTimeAgo, calcDiscount } from "@/lib/utils";
import { createAlert } from "@/app/actions";

const CERT_BADGES: Record<string, { label: string; color: string }> = {
  premium: { label: "Premium", color: "text-coral" },
  trusted: { label: "Trusted", color: "text-condition-excellent-text" },
  verified: { label: "Verified", color: "text-condition-likenew-text" },
  unverified: { label: "", color: "" },
};

interface ProductPageClientProps {
  product: ProductDetail;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const [sortBy, setSortBy] = useState<string>("price-low");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");

  const prices = product.listings.map((l) => l.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Get unique values for filters
  const conditions = [...new Set(product.listings.map((l) => l.condition))];
  const cities = [...new Set(product.listings.map((l) => l.location))];

  // Get unique spec keys and their values
  const specKeys = new Map<string, Set<string>>();
  product.listings.forEach((l) => {
    Object.entries(l.specs).forEach(([key, val]) => {
      if (!specKeys.has(key)) specKeys.set(key, new Set());
      specKeys.get(key)!.add(val);
    });
  });
  const [specFilters, setSpecFilters] = useState<Record<string, string>>({});

  const filteredListings = useMemo(() => {
    let result = [...product.listings];

    if (conditionFilter !== "all") {
      result = result.filter((l) => l.condition === conditionFilter);
    }
    if (cityFilter !== "all") {
      result = result.filter((l) => l.location === cityFilter);
    }

    // Apply spec filters
    Object.entries(specFilters).forEach(([key, val]) => {
      if (val !== "all") {
        result = result.filter((l) => l.specs[key] === val);
      }
    });

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "featured":
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [product.listings, conditionFilter, cityFilter, specFilters, sortBy]);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline shrink-0">
            Second <span className="text-coral">App</span>
          </Link>
          <div className="w-px h-5 bg-border" />
          <nav className="text-[12px] text-text-muted flex items-center gap-1">
            <Link href="/" className="hover:text-text-secondary no-underline text-text-muted">Home</Link>
            <span>/</span>
            <Link href={`/category/${product.categorySlug}`} className="hover:text-text-secondary no-underline text-text-muted">{product.categoryName}</Link>
            <span>/</span>
            <span className="text-text-primary font-medium">{product.displayName}</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1140px] px-4 sm:px-6 py-5">
        {/* Product header */}
        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">{product.displayName}</h1>
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">{formatPrice(minPrice)} – {formatPrice(maxPrice)}</span>
            <span className="text-text-faint">|</span>
            <span>{product.listings.length} {product.listings.length === 1 ? "listing" : "listings"}</span>
            <span className="text-text-faint">|</span>
            <span>{product.brandName}</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-[12px] px-2.5 py-1.5 rounded-md border border-border bg-white text-text-primary cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>

          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="text-[12px] px-2.5 py-1.5 rounded-md border border-border bg-white text-text-primary cursor-pointer"
          >
            <option value="all">All Conditions</option>
            {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {cities.length > 1 && (
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="text-[12px] px-2.5 py-1.5 rounded-md border border-border bg-white text-text-primary cursor-pointer"
            >
              <option value="all">All Cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          {/* Spec-based filters */}
          {[...specKeys.entries()].map(([key, values]) => {
            if (values.size <= 1) return null;
            return (
              <select
                key={key}
                value={specFilters[key] || "all"}
                onChange={(e) => setSpecFilters((prev) => ({ ...prev, [key]: e.target.value }))}
                className="text-[12px] px-2.5 py-1.5 rounded-md border border-border bg-white text-text-primary cursor-pointer capitalize"
              >
                <option value="all">All {key}</option>
                {[...values].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            );
          })}

          <span className="text-[11px] text-text-faint ml-auto">{filteredListings.length} results</span>
        </div>

        {/* Listings grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredListings.map((listing, idx) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                categorySlug={product.categorySlug}
                isLowestPrice={idx === 0 && sortBy === "price-low"}
                rank={idx + 1}
                totalListings={filteredListings.length}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-faint">
            <p className="text-sm font-semibold text-text-secondary mb-1">No listings match your filters</p>
            <p className="text-xs mb-3">Try adjusting your filters</p>
            <button
              onClick={() => { setConditionFilter("all"); setCityFilter("all"); setSpecFilters({}); }}
              className="px-4 py-1.5 rounded-md border-none bg-text-primary text-white text-[11px] font-semibold cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Deal alert */}
        <DealAlertCard productSlug={product.slug} productName={product.displayName} />
      </main>
    </div>
  );
}

function DealAlertCard({ productSlug, productName }: { productSlug: string; productName: string }) {
  const [showForm, setShowForm] = useState(false);
  const [maxPrice, setMaxPrice] = useState("");
  const [alertSet, setAlertSet] = useState(false);
  const [setting, setSetting] = useState(false);

  const handleSetAlert = async () => {
    setSetting(true);
    const result = await createAlert({
      productSlug,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
    });
    if (result.success) {
      setAlertSet(true);
    }
    setSetting(false);
  };

  if (alertSet) {
    return (
      <div className="mt-6 bg-condition-likenew-bg border border-[#bbf7d0] rounded-[10px] px-5 py-4 flex items-center gap-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
        <div>
          <p className="text-[13px] font-semibold text-condition-likenew-text">Alert set for {productName}!</p>
          <p className="text-[11px] text-condition-likenew-text/70">We&apos;ll notify you when a matching listing is posted. <Link href="/alerts" className="underline font-medium">Manage alerts</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-card border border-border rounded-[10px] px-5 py-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[13px] font-semibold text-text-primary mb-0.5">
            Want a better deal on {productName}?
          </p>
          <p className="text-[11px] text-text-muted">
            Get notified when a new listing matches your criteria.
          </p>
        </div>
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="px-3.5 py-[7px] rounded-md bg-coral text-white text-[11px] font-semibold cursor-pointer border-none"
          >
            Set Alert
          </button>
        ) : null}
      </div>
      {showForm && (
        <div className="mt-3 pt-3 border-t border-border flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-medium text-text-muted mb-1">Max price (optional)</label>
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <span className="px-2 py-1.5 text-[12px] text-text-muted bg-input-light border-r border-border">₹</span>
              <input
                type="text"
                inputMode="numeric"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
                placeholder="Any price"
                className="flex-1 px-2 py-1.5 text-[12px] border-none bg-transparent text-text-primary"
              />
            </div>
          </div>
          <button
            onClick={handleSetAlert}
            disabled={setting}
            className="px-4 py-[7px] rounded-md bg-coral text-white text-[11px] font-semibold cursor-pointer border-none disabled:opacity-50"
          >
            {setting ? "Setting..." : "Confirm Alert"}
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="px-3 py-[7px] rounded-md border border-border bg-white text-text-muted text-[11px] font-medium cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function ListingCard({ listing, categorySlug, isLowestPrice, rank, totalListings }: {
  listing: ProductListingData;
  categorySlug: string;
  isLowestPrice?: boolean;
  rank?: number;
  totalListings?: number;
}) {
  const condStyle = CONDITION_COLORS[listing.condition] || { bg: "bg-gray-100", text: "text-gray-700" };
  const discount = calcDiscount(listing.price, listing.originalPrice);
  const certBadge = CERT_BADGES[listing.vendorCertification];
  const icon = CATEGORY_ICONS[categorySlug] || CATEGORY_ICONS.phones;

  return (
    <Link href={`/listing/${listing.id}`} className="no-underline text-inherit block">
      <div className={`bg-card border overflow-hidden hover:-translate-y-px hover:shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all cursor-pointer rounded-[10px] ${
        isLowestPrice ? "border-coral-border ring-1 ring-coral/20" : "border-border"
      }`}>
        {/* Image */}
        <div className="aspect-[16/9] bg-input flex items-center justify-center relative">
          {listing.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#ccc"><path d={icon} /></svg>
          )}
          <span className={`absolute bottom-2 left-2 text-[10px] px-1.5 py-0.5 font-semibold rounded-[3px] ${condStyle.bg} ${condStyle.text}`}>
            {listing.condition}
          </span>
          {isLowestPrice && (
            <span className="absolute top-2 left-2 text-[9px] px-1.5 py-0.5 bg-coral text-white font-bold rounded-[3px]">
              LOWEST PRICE
            </span>
          )}
          {!isLowestPrice && listing.adminCertified && (
            <span className="absolute top-2 left-2 text-[9px] px-1.5 py-0.5 bg-text-primary text-white font-semibold rounded-[3px]">
              CERTIFIED
            </span>
          )}
        </div>

        <div className="px-3.5 py-3">
          {/* Price row */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-lg font-bold text-[#111]">{formatPrice(listing.price)}</span>
            {listing.originalPrice && (
              <span className="text-[11px] text-text-muted line-through">{formatPrice(listing.originalPrice)}</span>
            )}
            {discount && (
              <span className="text-[10px] font-semibold text-condition-likenew-text bg-condition-likenew-bg px-1 py-px rounded">{discount}% off</span>
            )}
          </div>

          {/* Specs */}
          <div className="flex gap-1 flex-wrap mb-2">
            {Object.entries(listing.specs).map(([key, val]) => (
              <span key={key} className="text-[10px] text-text-secondary bg-input-light px-1.5 py-0.5 rounded-[3px]">
                {val}
              </span>
            ))}
          </div>

          {/* Vendor info */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-text-primary">{listing.vendorName}</span>
              {certBadge?.label && (
                <span className={`text-[9px] font-semibold ${certBadge.color}`}>{certBadge.label}</span>
              )}
            </div>
            <span className="text-[10px] text-text-muted">{listing.location}</span>
          </div>

          {/* Buy Now button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="w-full py-2 rounded-md bg-coral text-white text-[12px] font-semibold border-none cursor-pointer hover:bg-[#d44a34] transition-colors"
          >
            Buy Now
          </button>

          {/* FOMO */}
          {listing.viewCount > 80 && (
            <p className="text-[10px] text-coral font-medium mt-1.5 text-center">
              {Math.floor(listing.viewCount / 12)} people viewing
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
