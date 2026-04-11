import Link from "next/link";
import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const formatPrice = (paise: number) => "₹" + Math.round(paise / 100).toLocaleString("en-IN");

export default async function VendorAnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const vendor = await prisma.vendor.findFirst({ where: { userId: session.userId } });
  if (!vendor) redirect("/vendor/register");

  const [listings, orders, reviews] = await Promise.all([
    prisma.listing.findMany({
      where: { vendorId: vendor.id },
      select: { id: true, price: true, status: true, viewCount: true, inquiryCount: true, condition: true, createdAt: true, product: { select: { displayName: true } } },
    }),
    prisma.order.findMany({
      where: { vendorId: vendor.id },
      select: { amount: true, commissionAmount: true, orderStatus: true, createdAt: true },
    }),
    prisma.review.findMany({
      where: { vendorId: vendor.id },
      select: { rating: true },
    }),
  ]);

  const totalViews = listings.reduce((sum, l) => sum + l.viewCount, 0);
  const totalInquiries = listings.reduce((sum, l) => sum + l.inquiryCount, 0);
  const totalRevenue = orders.filter((o) => o.orderStatus === "delivered").reduce((sum, o) => sum + o.amount, 0);
  const totalCommission = orders.filter((o) => o.orderStatus === "delivered").reduce((sum, o) => sum + o.commissionAmount, 0);
  const activeListings = listings.filter((l) => l.status === "active").length;
  const soldListings = listings.filter((l) => l.status === "sold").length;
  const conversionRate = totalViews > 0 ? ((orders.length / totalViews) * 100).toFixed(1) : "0";

  // Top performing listings
  const topListings = [...listings]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rev) => rev.rating === r).length,
  }));

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/vendor/dashboard" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">Second <span className="text-coral">App</span></Link>
          <div className="w-px h-5 bg-border" />
          <span className="text-[12px] font-medium text-text-muted">Analytics</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1140px] px-4 sm:px-6 py-5">
        <h1 className="text-xl font-bold text-text-primary mb-5">Analytics — {vendor.storeName}</h1>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Revenue", value: formatPrice(totalRevenue), sub: `After commission: ${formatPrice(totalRevenue - totalCommission)}` },
            { label: "Total Views", value: totalViews.toLocaleString("en-IN"), sub: `${totalInquiries} inquiries` },
            { label: "Conversion Rate", value: `${conversionRate}%`, sub: `${orders.length} orders from ${totalViews} views` },
            { label: "Listings", value: `${activeListings} active`, sub: `${soldListings} sold total` },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-[10px] px-4 py-3.5">
              <p className="text-xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-[11px] font-medium text-text-secondary">{stat.label}</p>
              <p className="text-[10px] text-text-muted mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top performing */}
          <div className="bg-card border border-border rounded-[10px] overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-bold text-text-primary">Top Performing Listings</h2>
            </div>
            <div className="divide-y divide-border">
              {topListings.map((l, i) => (
                <div key={l.id} className="px-4 py-2.5 flex items-center gap-3">
                  <span className="text-[11px] font-bold text-text-muted w-5 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-text-primary truncate">{l.product.displayName}</p>
                    <p className="text-[10px] text-text-muted">{formatPrice(l.price)} · {l.condition}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-semibold text-text-primary">{l.viewCount} views</p>
                    <p className="text-[10px] text-text-muted">{l.inquiryCount} inquiries</p>
                  </div>
                </div>
              ))}
              {topListings.length === 0 && <p className="px-4 py-4 text-[13px] text-text-muted text-center">No listings yet</p>}
            </div>
          </div>

          {/* Rating distribution */}
          <div className="bg-card border border-border rounded-[10px] overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-bold text-text-primary">Rating Distribution</h2>
            </div>
            <div className="px-4 py-4">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-text-primary">{vendor.ratingAvg.toFixed(1)}</p>
                <p className="text-coral text-sm">{"★".repeat(Math.round(vendor.ratingAvg))}</p>
                <p className="text-[11px] text-text-muted">{vendor.ratingCount} reviews</p>
              </div>
              <div className="space-y-2">
                {ratingDist.map((rd) => (
                  <div key={rd.stars} className="flex items-center gap-2">
                    <span className="text-[11px] text-text-muted w-8">{rd.stars} ★</span>
                    <div className="flex-1 h-2 bg-input rounded-full overflow-hidden">
                      <div
                        className="h-full bg-coral rounded-full"
                        style={{ width: reviews.length > 0 ? `${(rd.count / reviews.length) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="text-[11px] text-text-muted w-6 text-right">{rd.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
