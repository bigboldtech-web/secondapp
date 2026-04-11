"use client";

import { ListingCardData } from "@/lib/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  items: ListingCardData[];
  isMobile: boolean;
}

export default function ProductGrid({ items, isMobile }: ProductGridProps) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] sm:gap-3">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${Math.min(i * 0.02, 0.25)}s` }}
        >
          <ProductCard item={item} compact={isMobile} />
        </div>
      ))}
    </div>
  );
}
