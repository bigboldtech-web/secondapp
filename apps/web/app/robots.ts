import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/vendor/", "/checkout/", "/profile/", "/orders/", "/inbox/", "/api/", "/alerts/", "/saved/", "/notifications/"],
      },
    ],
    sitemap: "https://gosecond.in/sitemap.xml",
  };
}
