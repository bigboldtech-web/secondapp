import { ImageResponse } from "next/og";
import { prisma } from "@second-app/database";

export const runtime = "nodejs";
export const alt = "Second App product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
      listings: { where: { status: "active" }, select: { price: true } },
    },
  });

  if (!product || product.listings.length === 0) {
    return new ImageResponse(
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#fafafa", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 32, color: "#222" }}>Second App</span>
      </div>,
      { ...size }
    );
  }

  const prices = product.listings.map((l) => l.price);
  const minPrice = `₹${Math.round(Math.min(...prices) / 100).toLocaleString("en-IN")}`;
  const maxPrice = `₹${Math.round(Math.max(...prices) / 100).toLocaleString("en-IN")}`;

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
        <span style={{ fontSize: 24, fontWeight: 800, color: "#222" }}>Second </span>
        <span style={{ fontSize: 24, fontWeight: 800, color: "#E8553D" }}>App</span>
        <span style={{ fontSize: 14, color: "#999", marginLeft: "16px" }}>
          {product.category.name} · {product.brand.name}
        </span>
      </div>

      <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>
        <h1 style={{ fontSize: 52, fontWeight: 800, color: "#111", margin: "0 0 20px 0" }}>
          {product.displayName}
        </h1>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "20px" }}>
          <span style={{ fontSize: 42, fontWeight: 800, color: "#E8553D" }}>{minPrice} – {maxPrice}</span>
        </div>
        <span style={{ fontSize: 20, color: "#555" }}>
          {product.listings.length} listing{product.listings.length !== 1 ? "s" : ""} from verified dealers
        </span>
      </div>

      <span style={{ fontSize: 14, color: "#999" }}>Compare prices · Escrow protection · gosecond.in</span>
    </div>,
    { ...size }
  );
}
