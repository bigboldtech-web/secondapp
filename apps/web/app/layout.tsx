import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Second App — India's Trusted Marketplace for Certified Pre-Owned Products",
  description: "Buy and sell certified second-hand phones, laptops, tablets, cars, and bikes from verified dealers. Compare prices, check conditions, and shop with confidence.",
  openGraph: {
    title: "Second App — Certified Pre-Owned Marketplace",
    description: "India's trusted marketplace for certified second-hand products from verified dealers.",
    siteName: "Second App",
    type: "website",
    url: "https://gosecond.in",
  },
  twitter: {
    card: "summary_large_image",
    title: "Second App — Certified Pre-Owned Marketplace",
    description: "India's trusted marketplace for certified second-hand products from verified dealers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
