import Link from "next/link";
import { prisma } from "@second-app/database";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const formatPrice = (paise: number) => "₹" + Math.round(paise / 100).toLocaleString("en-IN");

export default async function GrowthPage() {
  await requireAdmin();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const yesterday = new Date(now.getTime() - 86400000);

  const [
    totalUsers,
    usersLast30d,
    usersLast7d,
    totalVendors,
    vendorsLast30d,
    totalListings,
    listingsLast30d,
    activeListings,
    totalOrders,
    ordersLast30d,
    ordersLast7d,
    deliveredOrders,
    searches,
    searchesLast7d,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.vendor.count(),
    prisma.vendor.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.listing.count(),
    prisma.listing.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.listing.count({ where: { status: "active" } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.order.findMany({
      where: { orderStatus: "delivered" },
      select: { amount: true, createdAt: true },
    }),
    prisma.searchQueryLog.count(),
    prisma.searchQueryLog.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);

  const gmv = deliveredOrders.reduce((s, o) => s + o.amount, 0);
  const gmvLast30d = deliveredOrders.filter((o) => o.createdAt >= thirtyDaysAgo).reduce((s, o) => s + o.amount, 0);

  const months = new Map<string, { users: number; vendors: number; listings: number; orders: number; gmv: number }>();
  const allUsers = await prisma.user.findMany({ select: { createdAt: true } });
  const allVendors = await prisma.vendor.findMany({ select: { createdAt: true } });
  const allListings = await prisma.listing.findMany({ select: { createdAt: true } });
  const allOrders = await prisma.order.findMany({ select: { createdAt: true, amount: true, orderStatus: true } });

  for (const u of allUsers) {
    const key = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const e = months.get(key) ?? { users: 0, vendors: 0, listings: 0, orders: 0, gmv: 0 };
    e.users++;
    months.set(key, e);
  }
  for (const v of allVendors) {
    const key = `${v.createdAt.getFullYear()}-${String(v.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const e = months.get(key) ?? { users: 0, vendors: 0, listings: 0, orders: 0, gmv: 0 };
    e.vendors++;
    months.set(key, e);
  }
  for (const l of allListings) {
    const key = `${l.createdAt.getFullYear()}-${String(l.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const e = months.get(key) ?? { users: 0, vendors: 0, listings: 0, orders: 0, gmv: 0 };
    e.listings++;
    months.set(key, e);
  }
  for (const o of allOrders) {
    const key = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const e = months.get(key) ?? { users: 0, vendors: 0, listings: 0, orders: 0, gmv: 0 };
    e.orders++;
    if (o.orderStatus === "delivered") e.gmv += o.amount;
    months.set(key, e);
  }

  const monthlyData = [...months.entries()]
    .sort()
    .slice(-6)
    .map(([key, data]) => ({
      label: new Date(key + "-01").toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      ...data,
    }));

  const stats = [
    { label: "Total users", value: totalUsers.toLocaleString(), sub: `+${usersLast30d} this month, +${usersLast7d} this week` },
    { label: "Vendors", value: totalVendors.toLocaleString(), sub: `+${vendorsLast30d} this month` },
    { label: "Active listings", value: activeListings.toLocaleString(), sub: `${totalListings} total, +${listingsLast30d} this month` },
    { label: "Total orders", value: totalOrders.toLocaleString(), sub: `+${ordersLast30d} this month, +${ordersLast7d} this week` },
    { label: "Lifetime GMV", value: formatPrice(gmv), sub: `${formatPrice(gmvLast30d)} this month` },
    { label: "Searches", value: searches.toLocaleString(), sub: `+${searchesLast7d} this week` },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-neutral-900">Growth</h1>
            <p className="text-[13px] text-neutral-500 mt-0.5">Platform health at a glance.</p>
          </div>
          <Link href="/" className="text-[12px] text-neutral-500 no-underline hover:text-neutral-900">← Dashboard</Link>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-white border border-neutral-200 rounded-xl px-4 py-3.5">
              <p className="text-xl font-bold text-neutral-900">{s.value}</p>
              <p className="text-[12px] font-medium text-neutral-700">{s.label}</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {monthlyData.length > 0 && (
          <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200">
              <h2 className="text-sm font-bold text-neutral-900">Monthly growth</h2>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="text-[11px] uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="text-left font-medium py-2">Month</th>
                    <th className="text-right font-medium py-2">Users</th>
                    <th className="text-right font-medium py-2">Vendors</th>
                    <th className="text-right font-medium py-2">Listings</th>
                    <th className="text-right font-medium py-2">Orders</th>
                    <th className="text-right font-medium py-2">GMV</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m) => (
                    <tr key={m.label} className="border-t border-neutral-100">
                      <td className="py-2 font-medium text-neutral-900">{m.label}</td>
                      <td className="py-2 text-right tabular-nums">{m.users}</td>
                      <td className="py-2 text-right tabular-nums">{m.vendors}</td>
                      <td className="py-2 text-right tabular-nums">{m.listings}</td>
                      <td className="py-2 text-right tabular-nums">{m.orders}</td>
                      <td className="py-2 text-right tabular-nums text-green-700">{formatPrice(m.gmv)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
