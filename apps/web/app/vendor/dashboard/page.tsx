import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import { parsePhotos } from "@/lib/utils";
import ShareStoreButton from "./ShareStoreButton";

export const dynamic = "force-dynamic";

const CERT_LABELS: Record<string, string> = {
  unverified: "New Seller",
  verified: "Verified Seller",
  trusted: "Trusted Seller",
  premium: "Premium Seller",
};

function formatPrice(paise: number): string {
  return "₹" + Math.round(paise / 100).toLocaleString("en-IN");
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-IN");
}

export default async function VendorDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.userId },
    include: {
      listings: {
        include: { product: { select: { displayName: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vendor) redirect("/vendor/register");

  const active = vendor.listings.filter((l) => l.status === "active");
  const sold = vendor.listings.filter((l) => l.status === "sold");
  const totalViews = vendor.listings.reduce((sum, l) => sum + l.viewCount, 0);
  const totalInquiries = vendor.listings.reduce((sum, l) => sum + l.inquiryCount, 0);
  const videoCount = vendor.listings.filter((l) => l.videoUrl).length;
  const recent = vendor.listings.slice(0, 8);

  const stats = [
    { label: "Active Listings", value: formatNumber(active.length), sub: `${vendor.listings.length} total` },
    { label: "Total Views", value: formatNumber(totalViews), sub: "across all listings" },
    { label: "Inquiries", value: formatNumber(totalInquiries), sub: "buyer questions" },
    { label: "Sales", value: formatNumber(sold.length), sub: "completed" },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 h-[52px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">
              Second <span className="text-coral">App</span>
            </Link>
            <div className="w-px h-5 bg-border" />
            <span className="text-[12px] font-medium text-text-muted">Vendor Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/vendor/store/edit" className="px-3 py-1.5 rounded-md border border-border text-[12px] font-medium text-text-primary no-underline hidden sm:inline">
              Edit store
            </Link>
            <ShareStoreButton storeSlug={vendor.storeSlug} storeName={vendor.storeName} />
            <Link href={`/store/${vendor.storeSlug}`} className="px-3 py-1.5 rounded-md border border-border text-[12px] font-medium text-text-primary no-underline hidden sm:inline">
              View public store
            </Link>
            <Link href="/vendor/listings/new" className="px-3.5 py-1.5 rounded-md bg-coral text-white text-xs font-semibold no-underline">
              + New Listing
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1140px] px-4 sm:px-6 py-5">
        <div className="bg-card border border-border rounded-[10px] px-5 py-4 mb-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-input flex items-center justify-center text-lg font-bold text-text-muted">
              {vendor.storeName.charAt(0)}
            </div>
            <div>
              <h1 className="text-base font-bold text-text-primary">{vendor.storeName}</h1>
              <span className="text-[11px] text-coral font-medium">{CERT_LABELS[vendor.certificationLevel] ?? "Seller"}</span>
              {vendor.locationCity && (
                <span className="text-[11px] text-text-muted ml-2">{vendor.locationCity}</span>
              )}
              {vendor.kycStatus === "pending" && (
                <p className="text-[11px] text-condition-rough-text mt-0.5">
                  KYC pending — listings go to moderation until approved.
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-center">
            <div>
              <p className="text-sm font-bold text-text-primary">{vendor.ratingAvg.toFixed(1)} ★</p>
              <p className="text-[10px] text-text-muted">{vendor.ratingCount} reviews</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-sm font-bold text-text-primary">{videoCount}</p>
              <p className="text-[10px] text-text-muted">videos</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-[10px] px-4 py-3">
              <p className="text-xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-[11px] font-medium text-text-secondary mb-1">{stat.label}</p>
              <p className="text-[10px] text-text-muted">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-0 border-b border-border mb-4">
          {[
            { label: "Overview", href: "/vendor/dashboard", active: true },
            { label: "Listings", href: "/vendor/listings/manage", active: false },
            { label: "Orders", href: "/vendor/orders", active: false },
            { label: "Analytics", href: "/vendor/analytics", active: false },
          ].map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px no-underline ${
                tab.active ? "border-coral text-coral" : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="bg-card border border-border rounded-[10px] overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary">Recent Listings</h2>
            <Link href="/vendor/listings/manage" className="text-[11px] text-coral font-medium no-underline">View all →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] text-text-secondary mb-1">No listings yet</p>
              <p className="text-[11px] text-text-muted mb-3">Post your first product to start selling.</p>
              <Link href="/vendor/listings/new" className="inline-block px-4 py-2 bg-coral text-white text-[12px] font-semibold rounded no-underline">
                Post first listing
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wide">Product</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wide">Price</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wide hidden sm:table-cell">Condition</th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wide hidden sm:table-cell">Photos</th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wide hidden sm:table-cell">Video</th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wide">Views</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((l) => {
                    const photoCount = parsePhotos(l.photos).length;
                    return (
                      <tr key={l.id} className="border-b border-border last:border-0 hover:bg-bg/50">
                        <td className="px-4 py-3 text-[13px] font-medium text-text-primary">
                          <Link href={`/listing/${l.id}`} className="no-underline text-text-primary">{l.product.displayName}</Link>
                        </td>
                        <td className="px-4 py-3 text-[13px] font-bold text-text-primary">{formatPrice(l.price)}</td>
                        <td className="px-4 py-3 text-[12px] text-text-secondary hidden sm:table-cell">{l.condition}</td>
                        <td className="px-4 py-3 text-[12px] text-text-secondary text-center hidden sm:table-cell">{photoCount}</td>
                        <td className="px-4 py-3 text-[12px] text-text-secondary text-center hidden sm:table-cell">
                          {l.videoUrl ? "✓" : "—"}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-text-secondary text-center">{l.viewCount}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                            l.status === "active" ? "bg-condition-likenew-bg text-condition-likenew-text"
                              : l.status === "pending" ? "bg-condition-good-bg text-condition-good-text"
                              : l.status === "sold" ? "bg-condition-excellent-bg text-condition-excellent-text"
                              : "bg-input text-text-muted"
                          }`}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <Link href="/vendor/listings/new" className="bg-card border border-border rounded-[10px] px-4 py-4 no-underline hover:shadow-sm transition-shadow text-center">
            <div className="w-10 h-10 rounded-full bg-coral-light flex items-center justify-center mx-auto mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8553D" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            </div>
            <p className="text-sm font-semibold text-text-primary">Post New Listing</p>
            <p className="text-[11px] text-text-muted">Add a product to sell</p>
          </Link>
          <Link href="/vendor/store/edit" className="bg-card border border-border rounded-[10px] px-4 py-4 no-underline hover:shadow-sm transition-shadow text-center">
            <div className="w-10 h-10 rounded-full bg-condition-excellent-bg flex items-center justify-center mx-auto mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-text-primary">Customize store</p>
            <p className="text-[11px] text-text-muted">Logo, banner, bio &amp; city</p>
          </Link>
          <Link href="/vendor/listings/manage" className="bg-card border border-border rounded-[10px] px-4 py-4 no-underline hover:shadow-sm transition-shadow text-center">
            <div className="w-10 h-10 rounded-full bg-condition-good-bg flex items-center justify-center mx-auto mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <p className="text-sm font-semibold text-text-primary">Manage listings</p>
            <p className="text-[11px] text-text-muted">Edit, pause, or remove</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
