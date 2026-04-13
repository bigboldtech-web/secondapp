import Link from "next/link";
import { prisma } from "@second-app/database";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const formatPrice = (paise: number) => "₹" + Math.round(paise / 100).toLocaleString("en-IN");

export default async function RevenuePage() {
  await requireAdmin();

  const [orders, boostedCount, totalListings, totalVendors] = await Promise.all([
    prisma.order.findMany({
      select: { amount: true, commissionAmount: true, orderStatus: true, paymentStatus: true, createdAt: true },
    }),
    prisma.listing.count({ where: { isPromoted: true } }),
    prisma.listing.count(),
    prisma.vendor.count(),
  ]);

  const delivered = orders.filter((o) => o.orderStatus === "delivered");
  const gmv = delivered.reduce((s, o) => s + o.amount, 0);
  const totalCommission = delivered.reduce((s, o) => s + o.commissionAmount, 0);
  const heldPayments = orders.filter((o) => o.paymentStatus === "held").reduce((s, o) => s + o.amount, 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === "placed").length;
  const cancelledOrders = orders.filter((o) => o.orderStatus === "cancelled").length;
  const avgOrderValue = delivered.length > 0 ? Math.round(gmv / delivered.length) : 0;

  // Monthly GMV breakdown (last 6 months)
  const months = new Map<string, { gmv: number; orders: number; commission: number }>();
  for (const o of delivered) {
    const key = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const entry = months.get(key) ?? { gmv: 0, orders: 0, commission: 0 };
    entry.gmv += o.amount;
    entry.orders += 1;
    entry.commission += o.commissionAmount;
    months.set(key, entry);
  }
  const monthlyData = [...months.entries()]
    .sort()
    .slice(-6)
    .map(([key, data]) => ({
      label: new Date(key + "-01").toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      ...data,
    }));

  const stats = [
    { label: "Total GMV", value: formatPrice(gmv), sub: `${delivered.length} delivered orders` },
    { label: "Commission earned", value: formatPrice(totalCommission), sub: "7% platform fee" },
    { label: "In escrow", value: formatPrice(heldPayments), sub: "awaiting delivery confirmation" },
    { label: "Avg order value", value: formatPrice(avgOrderValue), sub: "per delivered order" },
    { label: "Active boosts", value: String(boostedCount), sub: "promoted listings" },
    { label: "Pending orders", value: String(pendingOrders), sub: `${cancelledOrders} cancelled` },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-neutral-900">Revenue</h1>
            <p className="text-[13px] text-neutral-500 mt-0.5">
              {totalListings} listings · {totalVendors} vendors · {orders.length} total orders
            </p>
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
              <h2 className="text-sm font-bold text-neutral-900">Monthly GMV</h2>
            </div>
            <div className="p-4">
              <table className="w-full text-[13px]">
                <thead className="text-[11px] uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="text-left font-medium py-2">Month</th>
                    <th className="text-right font-medium py-2">GMV</th>
                    <th className="text-right font-medium py-2">Commission</th>
                    <th className="text-right font-medium py-2">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m) => (
                    <tr key={m.label} className="border-t border-neutral-100">
                      <td className="py-2 font-medium text-neutral-900">{m.label}</td>
                      <td className="py-2 text-right tabular-nums">{formatPrice(m.gmv)}</td>
                      <td className="py-2 text-right tabular-nums text-green-700">{formatPrice(m.commission)}</td>
                      <td className="py-2 text-right tabular-nums">{m.orders}</td>
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
