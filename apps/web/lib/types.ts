// ============================================================
// Category types
// ============================================================

export type CategorySlug =
  | "phones"
  | "laptops"
  | "tablets"
  | "macbooks"
  | "cars"
  | "bikes"
  | "gaming"
  | "accessories";

export type Condition = "Like New" | "Excellent" | "Better" | "Best" | "Good" | "Rough" | "Fair" | "Certified";

export interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  listingCount: number;
}

// ============================================================
// Listing card data (used on homepage, grids, etc.)
// ============================================================

export interface ListingCardData {
  id: string;
  title: string;         // Product display name + key specs
  price: number;         // in paise
  originalPrice: number | null;
  condition: string;
  specs: Record<string, string>;
  thumbnail: string | null;
  vendorName: string;
  vendorSlug: string;
  vendorCertification: string;
  productSlug: string;
  categorySlug: string;
  location: string;
  createdAt: Date;
  isFeatured: boolean;
  adminCertified: boolean;
}

// ============================================================
// Product detail (for grouping page)
// ============================================================

export interface ProductDetail {
  id: string;
  slug: string;
  displayName: string;
  categoryName: string;
  categorySlug: string;
  brandName: string;
  modelName: string;
  specsTemplate: Record<string, string[]> | null;
  listings: ProductListingData[];
}

export interface ProductListingData {
  id: string;
  price: number;
  originalPrice: number | null;
  condition: string;
  specs: Record<string, string>;
  thumbnail: string | null;
  description: string | null;
  vendorName: string;
  vendorSlug: string;
  vendorCertification: string;
  vendorRating: number;
  vendorSales: number;
  location: string;
  createdAt: Date;
  isFeatured: boolean;
  adminCertified: boolean;
  viewCount: number;
}

// ============================================================
// Listing detail (for individual listing page)
// ============================================================

export interface ListingDetail {
  id: string;
  price: number;
  originalPrice: number | null;
  condition: string;
  specs: Record<string, string>;
  description: string | null;
  photos: string[];
  videoUrl: string | null;
  viewCount: number;
  inquiryCount: number;
  createdAt: Date;
  isFeatured: boolean;
  adminCertified: boolean;
  product: {
    slug: string;
    displayName: string;
    category: { name: string; slug: string };
    brand: { name: string; slug: string };
    model: { name: string };
  };
  vendor: {
    id: string;
    storeName: string;
    storeSlug: string;
    certificationLevel: string;
    ratingAvg: number;
    ratingCount: number;
    totalSales: number;
    locationCity: string | null;
    bio: string | null;
  };
}

// ============================================================
// Vendor profile (for store page)
// ============================================================

export interface VendorProfile {
  id: string;
  storeName: string;
  storeSlug: string;
  bio: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  locationCity: string | null;
  certificationLevel: string;
  kycStatus: string;
  ratingAvg: number;
  ratingCount: number;
  totalSales: number;
  totalListings: number;
  createdAt: Date;
  listings: StoreListing[];
  reviews: VendorReview[];
}

// Richer than ListingCardData: also carries videoUrl + photo count so the
// store page can render a dedicated Videos rail alongside the listings grid.
export interface StoreListing extends ListingCardData {
  videoUrl: string | null;
  photoCount: number;
}

export interface VendorReview {
  id: string;
  rating: number;
  comment: string | null;
  buyerName: string;
  createdAt: Date;
}

// ============================================================
// SVG icons for categories (kept from original for UI)
// ============================================================

export const CATEGORY_ICONS: Record<string, string> = {
  phones: "M15.5 1h-8A2.5 2.5 0 005 3.5v17A2.5 2.5 0 007.5 23h8a2.5 2.5 0 002.5-2.5v-17A2.5 2.5 0 0015.5 1zm-4 21a1 1 0 110-2 1 1 0 010 2zm4.5-4H7V4h9v14z",
  laptops: "M20 18l2 2H2l2-2V4a2 2 0 012-2h12a2 2 0 012 2v14zM6 4v12h12V4H6z",
  tablets: "M19 1H5a2 2 0 00-2 2v18a2 2 0 002 2h14a2 2 0 002-2V3a2 2 0 00-2-2zm-7 20a1 1 0 110-2 1 1 0 010 2zm7-4H5V4h14v13z",
  macbooks: "M20 18l2 2H2l2-2V4a2 2 0 012-2h12a2 2 0 012 2v14zM6 4v12h12V4H6z",
  cars: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-8l-2.08-5.99zM6.5 16a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm11 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM5 11l1.5-4.5h11L19 11H5z",
  bikes: "M19 13a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zM5 13a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zM16 6l-3 5h3l1-2h2l-1.5-3H16zm-5 5l2-3.5L11.5 5H8l3 6z",
  gaming: "M21 6H3a2 2 0 00-2 2v8a2 2 0 002 2h18a2 2 0 002-2V8a2 2 0 00-2-2zm-10 7H9v2H7v-2H5v-2h2V9h2v2h2v2zm4.5 2a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4-3a1.5 1.5 0 110-3 1.5 1.5 0 010 3z",
  accessories: "M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
};

export const CONDITION_COLORS: Record<string, { bg: string; text: string }> = {
  "Like New": { bg: "bg-condition-likenew-bg", text: "text-condition-likenew-text" },
  "Excellent": { bg: "bg-condition-excellent-bg", text: "text-condition-excellent-text" },
  "Better": { bg: "bg-condition-better-bg", text: "text-condition-better-text" },
  "Best": { bg: "bg-condition-better-bg", text: "text-condition-better-text" },
  "Good": { bg: "bg-condition-good-bg", text: "text-condition-good-text" },
  "Rough": { bg: "bg-condition-rough-bg", text: "text-condition-rough-text" },
  "Fair": { bg: "bg-condition-good-bg", text: "text-condition-good-text" },
  "Certified": { bg: "bg-condition-likenew-bg", text: "text-condition-likenew-text" },
};

export const CITIES = [
  "All India",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
];
