"use client";

import Link from "next/link";

const stats = [
  { label: "Active Listings", value: "11", change: "+2 this week" },
  { label: "Total Views", value: "2,847", change: "+324 this week" },
  { label: "Inquiries", value: "89", change: "+12 this week" },
  { label: "Sales", value: "508", change: "+3 this month" },
];

const recentListings = [
  { id: 1, title: "iPhone 15 Pro Max 256GB", price: "₹1,09,999", condition: "Like New", views: 230, inquiries: 23, status: "active" },
  { id: 2, title: "iPhone 15 Pro Max 512GB", price: "₹1,29,999", condition: "Like New", views: 185, inquiries: 15, status: "active" },
  { id: 3, title: "iPhone 15 Pro 128GB", price: "₹89,999", condition: "Excellent", views: 142, inquiries: 18, status: "active" },
  { id: 4, title: "iPhone 14 128GB", price: "₹38,999", condition: "Good", views: 98, inquiries: 8, status: "active" },
  { id: 5, title: "OnePlus 12 256GB", price: "₹42,999", condition: "Excellent", views: 156, inquiries: 11, status: "active" },
];

export default function VendorDashboard() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Vendor header */}
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
            <Link href="/vendor/listings/new" className="px-3.5 py-1.5 rounded-md bg-coral text-white text-xs font-semibold no-underline">
              + New Listing
            </Link>
            <div className="w-8 h-8 rounded-full bg-input flex items-center justify-center text-xs font-bold text-text-muted">P</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1140px] px-4 sm:px-6 py-5">
        {/* Vendor info banner */}
        <div className="bg-card border border-border rounded-[10px] px-5 py-4 mb-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-input flex items-center justify-center text-lg font-bold text-text-muted">P</div>
            <div>
              <h1 className="text-base font-bold text-text-primary">PhoneHub</h1>
              <span className="text-[11px] text-coral font-medium">Premium Seller</span>
              <span className="text-[11px] text-text-muted ml-2">Mumbai</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-center">
            <div>
              <p className="text-sm font-bold text-text-primary">4.2 ★</p>
              <p className="text-[10px] text-text-muted">Rating</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <Link href="/vendor/store" className="text-[11px] text-coral font-medium no-underline">Edit Store →</Link>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-[10px] px-4 py-3">
              <p className="text-xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-[11px] font-medium text-text-secondary mb-1">{stat.label}</p>
              <p className="text-[10px] text-condition-likenew-text">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-0 border-b border-border mb-4">
          {[
            { label: "Overview", href: "/vendor/dashboard", active: true },
            { label: "Listings", href: "/vendor/listings", active: false },
            { label: "Orders", href: "#", active: false },
            { label: "Analytics", href: "#", active: false },
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

        {/* Recent listings table */}
        <div className="bg-card border border-border rounded-[10px] overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary">Recent Listings</h2>
            <Link href="/vendor/listings" className="text-[11px] text-coral font-medium no-underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wide">Product</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wide">Price</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wide hidden sm:table-cell">Condition</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wide hidden sm:table-cell">Views</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wide">Inquiries</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentListings.map((listing) => (
                  <tr key={listing.id} className="border-b border-border last:border-0 hover:bg-bg/50">
                    <td className="px-4 py-3 text-[13px] font-medium text-text-primary">{listing.title}</td>
                    <td className="px-4 py-3 text-[13px] font-bold text-text-primary">{listing.price}</td>
                    <td className="px-4 py-3 text-[12px] text-text-secondary hidden sm:table-cell">{listing.condition}</td>
                    <td className="px-4 py-3 text-[12px] text-text-secondary text-center hidden sm:table-cell">{listing.views}</td>
                    <td className="px-4 py-3 text-[12px] text-text-secondary text-center">{listing.inquiries}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-condition-likenew-bg text-condition-likenew-text capitalize">
                        {listing.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <Link href="/vendor/listings/new" className="bg-card border border-border rounded-[10px] px-4 py-4 no-underline hover:shadow-sm transition-shadow text-center">
            <div className="w-10 h-10 rounded-full bg-coral-light flex items-center justify-center mx-auto mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8553D" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            </div>
            <p className="text-sm font-semibold text-text-primary">Post New Listing</p>
            <p className="text-[11px] text-text-muted">Add a product to sell</p>
          </Link>
          <Link href="/vendor/listings" className="bg-card border border-border rounded-[10px] px-4 py-4 no-underline hover:shadow-sm transition-shadow text-center">
            <div className="w-10 h-10 rounded-full bg-condition-excellent-bg flex items-center justify-center mx-auto mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <p className="text-sm font-semibold text-text-primary">Manage Listings</p>
            <p className="text-[11px] text-text-muted">Edit, pause, or remove</p>
          </Link>
          <div className="bg-card border border-border rounded-[10px] px-4 py-4 text-center">
            <div className="w-10 h-10 rounded-full bg-condition-good-bg flex items-center justify-center mx-auto mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4" /></svg>
            </div>
            <p className="text-sm font-semibold text-text-primary">Analytics</p>
            <p className="text-[11px] text-text-muted">Coming soon</p>
          </div>
        </div>
      </main>
    </div>
  );
}
