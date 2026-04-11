"use client";

import { ListingCardData } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

interface SimilarListingsProps {
  listings: ListingCardData[];
  productName: string;
}

export default function SimilarListings({ listings, productName }: SimilarListingsProps) {
  return (
    <div className="mt-8">
      <h2 className="text-[15px] font-bold text-text-primary mb-3">
        More {productName} listings
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {listings.map((item) => (
          <ProductCard key={item.id} item={item} compact />
        ))}
      </div>
    </div>
  );
}
