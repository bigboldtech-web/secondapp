import type { ListingDetail, VendorProfile, ProductDetail } from "./types";

export function listingJsonLd(listing: ListingDetail, url: string): object {
  const price = (listing.price / 100).toFixed(2);
  const condition = mapCondition(listing.condition);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.product.displayName,
    description: listing.description || `${listing.product.displayName} in ${listing.condition} condition`,
    image: listing.photos.length > 0 ? listing.photos : undefined,
    brand: {
      "@type": "Brand",
      name: listing.product.brand.name,
    },
    category: listing.product.category.name,
    itemCondition: condition,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price,
      availability: listing.quantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
      seller: {
        "@type": "Organization",
        name: listing.vendor.storeName,
        url: `https://gosecond.in/store/${listing.vendor.storeSlug}`,
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 2,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "d" },
          transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 7, unitCode: "d" },
        },
      },
    },
    aggregateRating: listing.vendor.ratingCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: listing.vendor.ratingAvg.toFixed(1),
          reviewCount: listing.vendor.ratingCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };
}

export function productGroupJsonLd(product: ProductDetail, url: string): object {
  const prices = product.listings.map((l) => l.price / 100);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.displayName,
    description: `Compare ${product.listings.length} certified pre-owned ${product.displayName} listings from ₹${Math.round(minPrice).toLocaleString("en-IN")} to ₹${Math.round(maxPrice).toLocaleString("en-IN")}`,
    brand: {
      "@type": "Brand",
      name: product.brandName,
    },
    category: product.categoryName,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: minPrice.toFixed(2),
      highPrice: maxPrice.toFixed(2),
      priceCurrency: "INR",
      offerCount: product.listings.length,
      availability: "https://schema.org/InStock",
    },
  };
}

export function vendorStoreJsonLd(vendor: VendorProfile, url: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: vendor.storeName,
    description: vendor.bio || `Certified pre-owned products from ${vendor.storeName}`,
    url,
    image: vendor.logoUrl || undefined,
    address: vendor.locationCity
      ? {
          "@type": "PostalAddress",
          addressLocality: vendor.locationCity,
          addressCountry: "IN",
        }
      : undefined,
    aggregateRating: vendor.ratingCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: vendor.ratingAvg.toFixed(1),
          reviewCount: vendor.ratingCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };
}

export function breadcrumbJsonLd(items: { name: string; url?: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url ? `https://gosecond.in${item.url}` : undefined,
    })),
  };
}

function mapCondition(condition: string): string {
  const map: Record<string, string> = {
    "Like New": "https://schema.org/RefurbishedCondition",
    "Excellent": "https://schema.org/RefurbishedCondition",
    "Best": "https://schema.org/RefurbishedCondition",
    "Better": "https://schema.org/UsedCondition",
    "Good": "https://schema.org/UsedCondition",
    "Rough": "https://schema.org/UsedCondition",
    "Fair": "https://schema.org/UsedCondition",
  };
  return map[condition] || "https://schema.org/UsedCondition";
}
