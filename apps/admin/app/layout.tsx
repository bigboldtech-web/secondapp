import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Second App Admin",
  description: "Admin panel for Second App marketplace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
