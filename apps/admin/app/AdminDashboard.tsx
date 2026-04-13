"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { approveVendorKyc, rejectVendorKyc, upgradeVendor, approveListing, rejectListing, certifyListing } from "./actions";

interface Stats {
  totalUsers: number;
  totalVendors: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  totalOrders: number;
  pendingVendors: number;
}

interface RecentListing {
  id: string;
  productName: string;
  vendorName: string;
  price: number;
  condition: string;
  status: string;
  createdAt: string;
}

interface RecentVendor {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  kycStatus: string;
  certificationLevel: string;
  totalSales: number;
  createdAt: string;
}

interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  brandCount: number;
  productCount: number;
}

interface RecentOrder {
  id: string;
  productName: string;
  buyerName: string;
  vendorName: string;
  amount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

interface AdminDashboardProps {
  stats: Stats;
  recentListings: RecentListing[];
  recentVendors: RecentVendor[];
  catalogCategories: CatalogCategory[];
  recentOrders: RecentOrder[];
}

const formatPrice = (paise: number) => "₹" + Math.round(paise / 100).toLocaleString("en-IN");

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
  { id: "vendors", label: "Vendors", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "listings", label: "Listings", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { id: "catalog", label: "Catalog", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { id: "orders", label: "Orders", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
];

export default function AdminDashboard({ stats, recentListings, recentVendors, catalogCategories, recentOrders }: AdminDashboardProps) {
  const [activePage, setActivePage] = useState("dashboard");

  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (fn: () => Promise<unknown>, key: string) => {
    setActionLoading(key);
    await fn();
    router.refresh();
    setActionLoading(null);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-[#eee] flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-[#eee]">
          <span className="text-base font-extrabold tracking-tight text-[#222]">
            Second <span className="text-[#E8553D]">App</span>
          </span>
          <p className="text-[10px] text-[#999] mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 py-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-medium cursor-pointer border-none text-left ${
                activePage === item.id
                  ? "bg-[#fdf4f3] text-[#E8553D] border-r-2 border-r-[#E8553D]"
                  : "bg-transparent text-[#666] hover:bg-[#f8f8f8]"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
              {item.id === "vendors" && stats.pendingVendors > 0 && (
                <span className="ml-auto text-[9px] bg-[#E8553D] text-white px-1.5 py-px rounded-full font-bold">{stats.pendingVendors}</span>
              )}
              {item.id === "listings" && stats.pendingListings > 0 && (
                <span className="ml-auto text-[9px] bg-[#E8553D] text-white px-1.5 py-px rounded-full font-bold">{stats.pendingListings}</span>
              )}
            </button>
          ))}
          <Link
            href="/search-insights"
            className="w-full flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-medium text-[#666] hover:bg-[#f8f8f8] no-underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Search insights
          </Link>
          <Link
            href="/reports"
            className="w-full flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-medium text-[#666] hover:bg-[#f8f8f8] no-underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Reports
          </Link>
          <Link
            href="/revenue"
            className="w-full flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-medium text-[#666] hover:bg-[#f8f8f8] no-underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20V10M18 20V4M6 20v-4" />
            </svg>
            Revenue
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {activePage === "dashboard" && (
          <>
            <h1 className="text-xl font-bold text-[#222] mb-5">Dashboard</h1>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Users", value: stats.totalUsers, color: "#1e40af" },
                { label: "Vendors", value: stats.totalVendors, color: "#166534" },
                { label: "Active Listings", value: stats.activeListings, color: "#E8553D" },
                { label: "Orders", value: stats.totalOrders, color: "#92400e" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-lg border border-[#eee] px-4 py-3.5">
                  <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[12px] text-[#999] font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Alert banners */}
            {stats.pendingVendors > 0 && (
              <div className="bg-[#fffbeb] border border-[#fbbf24] rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
                <p className="text-[13px] text-[#92400e] font-medium">{stats.pendingVendors} vendor(s) awaiting KYC verification</p>
                <button onClick={() => setActivePage("vendors")} className="text-[11px] text-[#92400e] font-bold bg-transparent border-none cursor-pointer underline">Review →</button>
              </div>
            )}
            {stats.pendingListings > 0 && (
              <div className="bg-[#eff6ff] border border-[#93c5fd] rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
                <p className="text-[13px] text-[#1e40af] font-medium">{stats.pendingListings} listing(s) awaiting moderation</p>
                <button onClick={() => setActivePage("listings")} className="text-[11px] text-[#1e40af] font-bold bg-transparent border-none cursor-pointer underline">Review →</button>
              </div>
            )}

            {/* Recent listings */}
            <div className="bg-white rounded-lg border border-[#eee] overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-[#eee] flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#222]">Recent Listings</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#eee]">
                    <th className="text-left px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Product</th>
                    <th className="text-left px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Vendor</th>
                    <th className="text-left px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Price</th>
                    <th className="text-left px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Condition</th>
                    <th className="text-right px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentListings.map((l) => (
                    <tr key={l.id} className="border-b border-[#eee] last:border-0 hover:bg-[#fafafa]">
                      <td className="px-4 py-2.5 text-[13px] font-medium text-[#222]">{l.productName}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#666]">{l.vendorName}</td>
                      <td className="px-4 py-2.5 text-[13px] font-bold text-[#222]">{formatPrice(l.price)}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#666]">{l.condition}</td>
                      <td className="px-4 py-2.5 text-right">
                        <StatusBadge status={l.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activePage === "vendors" && (
          <>
            <h1 className="text-xl font-bold text-[#222] mb-5">Vendor Management</h1>
            <div className="bg-white rounded-lg border border-[#eee] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#eee]">
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[#999] uppercase">Store</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[#999] uppercase">Owner</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[#999] uppercase">KYC</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[#999] uppercase">Level</th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-medium text-[#999] uppercase">Sales</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-medium text-[#999] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVendors.map((v) => (
                    <tr key={v.id} className="border-b border-[#eee] last:border-0 hover:bg-[#fafafa]">
                      <td className="px-4 py-3 text-[13px] font-medium text-[#222]">{v.storeName}</td>
                      <td className="px-4 py-3">
                        <p className="text-[12px] text-[#444]">{v.ownerName}</p>
                        <p className="text-[10px] text-[#999]">{v.email}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={v.kycStatus} /></td>
                      <td className="px-4 py-3 text-[12px] text-[#666] capitalize">{v.certificationLevel}</td>
                      <td className="px-4 py-3 text-[12px] text-[#666] text-center">{v.totalSales}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1.5 justify-end">
                          {v.kycStatus === "pending" && (
                            <>
                              <button disabled={actionLoading === `approve-${v.id}`} onClick={() => handleAction(() => approveVendorKyc(v.id), `approve-${v.id}`)} className="text-[10px] px-2 py-1 rounded bg-[#f0fdf4] text-[#166534] font-semibold border-none cursor-pointer disabled:opacity-50">
                                {actionLoading === `approve-${v.id}` ? "..." : "Approve"}
                              </button>
                              <button disabled={actionLoading === `reject-${v.id}`} onClick={() => handleAction(() => rejectVendorKyc(v.id), `reject-${v.id}`)} className="text-[10px] px-2 py-1 rounded bg-[#fef2f2] text-[#991b1b] font-semibold border-none cursor-pointer disabled:opacity-50">
                                {actionLoading === `reject-${v.id}` ? "..." : "Reject"}
                              </button>
                            </>
                          )}
                          {v.kycStatus === "verified" && v.certificationLevel !== "premium" && (
                            <button disabled={actionLoading === `upgrade-${v.id}`} onClick={() => handleAction(() => upgradeVendor(v.id, v.certificationLevel === "verified" ? "trusted" : "premium"), `upgrade-${v.id}`)} className="text-[10px] px-2 py-1 rounded bg-[#eff6ff] text-[#1e40af] font-semibold border-none cursor-pointer disabled:opacity-50">
                              {actionLoading === `upgrade-${v.id}` ? "..." : `→ ${v.certificationLevel === "verified" ? "Trusted" : "Premium"}`}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activePage === "listings" && (
          <>
            <h1 className="text-xl font-bold text-[#222] mb-5">Listing Moderation</h1>
            <div className="bg-white rounded-lg border border-[#eee] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#eee]">
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[#999] uppercase">Product</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[#999] uppercase">Vendor</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[#999] uppercase">Price</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[#999] uppercase">Status</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-medium text-[#999] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentListings.map((l) => (
                    <tr key={l.id} className="border-b border-[#eee] last:border-0 hover:bg-[#fafafa]">
                      <td className="px-4 py-3 text-[13px] font-medium text-[#222]">{l.productName}</td>
                      <td className="px-4 py-3 text-[12px] text-[#666]">{l.vendorName}</td>
                      <td className="px-4 py-3 text-[13px] font-bold text-[#222]">{formatPrice(l.price)}</td>
                      <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1.5 justify-end">
                          {l.status !== "active" && (
                            <button disabled={actionLoading === `al-${l.id}`} onClick={() => handleAction(() => approveListing(l.id), `al-${l.id}`)} className="text-[10px] px-2 py-1 rounded bg-[#f0fdf4] text-[#166534] font-semibold border-none cursor-pointer disabled:opacity-50">
                              {actionLoading === `al-${l.id}` ? "..." : "Approve"}
                            </button>
                          )}
                          {l.status === "active" && (
                            <button disabled={actionLoading === `rl-${l.id}`} onClick={() => handleAction(() => rejectListing(l.id), `rl-${l.id}`)} className="text-[10px] px-2 py-1 rounded bg-[#fef2f2] text-[#991b1b] font-semibold border-none cursor-pointer disabled:opacity-50">
                              {actionLoading === `rl-${l.id}` ? "..." : "Reject"}
                            </button>
                          )}
                          <button disabled={actionLoading === `cl-${l.id}`} onClick={() => handleAction(() => certifyListing(l.id), `cl-${l.id}`)} className="text-[10px] px-2 py-1 rounded bg-[#eff6ff] text-[#1e40af] font-semibold border-none cursor-pointer disabled:opacity-50">
                            {actionLoading === `cl-${l.id}` ? "..." : "Certify"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activePage === "catalog" && (
          <>
            <h1 className="text-xl font-bold text-[#222] mb-5">Catalog Management</h1>
            <div className="bg-white rounded-lg border border-[#eee] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#eee] flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#222]">Categories</h2>
                <span className="text-[11px] text-[#999]">{catalogCategories.length} categories</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#eee]">
                    <th className="text-left px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Category</th>
                    <th className="text-left px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Slug</th>
                    <th className="text-center px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Brands</th>
                    <th className="text-center px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Products</th>
                    <th className="text-center px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Order</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogCategories.map((cat) => (
                    <tr key={cat.id} className="border-b border-[#eee] last:border-0 hover:bg-[#fafafa]">
                      <td className="px-4 py-2.5 text-[13px] font-medium text-[#222]">{cat.name}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#666] font-mono">{cat.slug}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#666] text-center">{cat.brandCount}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#666] text-center">{cat.productCount}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#666] text-center">{cat.sortOrder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activePage === "orders" && (
          <>
            <h1 className="text-xl font-bold text-[#222] mb-5">Orders</h1>
            <div className="bg-white rounded-lg border border-[#eee] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#eee]">
                    <th className="text-left px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Product</th>
                    <th className="text-left px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Buyer</th>
                    <th className="text-left px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Vendor</th>
                    <th className="text-left px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Amount</th>
                    <th className="text-left px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Status</th>
                    <th className="text-left px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Payment</th>
                    <th className="text-left px-4 py-2 text-[10px] font-medium text-[#999] uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-[#eee] last:border-0 hover:bg-[#fafafa]">
                      <td className="px-4 py-2.5 text-[13px] font-medium text-[#222]">{o.productName}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#666]">{o.buyerName}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#666]">{o.vendorName}</td>
                      <td className="px-4 py-2.5 text-[13px] font-bold text-[#222]">{formatPrice(o.amount)}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={o.orderStatus} /></td>
                      <td className="px-4 py-2.5"><StatusBadge status={o.paymentStatus} /></td>
                      <td className="px-4 py-2.5 text-[11px] text-[#999]">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-6 text-center text-[13px] text-[#999]">No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-[#f0fdf4] text-[#166534]",
    pending: "bg-[#fffbeb] text-[#92400e]",
    verified: "bg-[#f0fdf4] text-[#166534]",
    rejected: "bg-[#fef2f2] text-[#991b1b]",
    draft: "bg-[#f5f5f5] text-[#666]",
    sold: "bg-[#eff6ff] text-[#1e40af]",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${styles[status] || "bg-[#f5f5f5] text-[#666]"}`}>
      {status}
    </span>
  );
}
