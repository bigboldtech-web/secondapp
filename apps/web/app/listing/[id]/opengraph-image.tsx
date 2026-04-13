import { ImageResponse } from "next/og";
import { prisma } from "@second-app/database";

export const runtime = "nodejs";
export const alt = "Second App listing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      product: { include: { brand: { select: { name: true } }, category: { select: { name: true } } } },
      vendor: { select: { storeName: true, certificationLevel: true, ratingAvg: true } },
    },
  });

  if (!listing) {
    return new ImageResponse(
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#fafafa", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 32, color: "#222" }}>Second App</span>
      </div>,
      { ...size }
    );
  }

  const price = `₹${Math.round(listing.price / 100).toLocaleString("en-IN")}`;
  const originalPrice = listing.originalPrice ? `₹${Math.round(listing.originalPrice / 100).toLocaleString("en-IN")}` : null;
  const discount = listing.originalPrice && listing.originalPrice > listing.price
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : null;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "#fafafa",
        padding: "60px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: "#222", letterSpacing: "-0.5px" }}>
          Second{" "}
        </span>
        <span style={{ fontSize: 24, fontWeight: 800, color: "#E8553D", letterSpacing: "-0.5px" }}>
          App
        </span>
        <span style={{ fontSize: 14, color: "#999", marginLeft: "16px" }}>
          {listing.product.category.name} · {listing.product.brand.name}
        </span>
      </div>

      <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>
        <h1 style={{ fontSize: 52, fontWeight: 800, color: "#111", margin: "0 0 16px 0", lineHeight: 1.1 }}>
          {listing.product.displayName}
        </h1>

        <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginBottom: "20px" }}>
          <span style={{ fontSize: 56, fontWeight: 800, color: "#E8553D" }}>{price}</span>
          {originalPrice && (
            <span style={{ fontSize: 28, color: "#999", textDecoration: "line-through" }}>{originalPrice}</span>
          )}
          {discount && (
            <span style={{ fontSize: 22, fontWeight: 700, color: "#166534", background: "#f0fdf4", padding: "4px 12px", borderRadius: "6px" }}>
              {discount}% off
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{
            fontSize: 18, fontWeight: 600,
            color: listing.condition === "Like New" ? "#166534" : listing.condition === "Good" ? "#92400e" : "#1e40af",
            background: listing.condition === "Like New" ? "#f0fdf4" : listing.condition === "Good" ? "#fffbeb" : "#eff6ff",
            padding: "6px 14px", borderRadius: "6px",
          }}>
            {listing.condition}
          </span>
          <span style={{ fontSize: 16, color: "#555" }}>
            {listing.vendor.storeName} · {listing.vendor.ratingAvg.toFixed(1)}★ · {listing.vendor.certificationLevel}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span style={{ fontSize: 14, color: "#999" }}>Buyer protection with escrow · gosecond.in</span>
      </div>
    </div>,
    { ...size }
  );
}
