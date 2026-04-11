import Link from "next/link";
import { getMyOrders } from "./actions";

export const dynamic = "force-dynamic";

const formatPrice = (paise: number) => "₹" + Math.round(paise / 100).toLocaleString("en-IN");

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-condition-good-bg text-condition-good-text",
  confirmed: "bg-condition-excellent-bg text-condition-excellent-text",
  shipped: "bg-condition-excellent-bg text-condition-excellent-text",
  delivered: "bg-condition-likenew-bg text-condition-likenew-text",
  cancelled: "bg-condition-rough-bg text-condition-rough-text",
};

export default async function OrdersPage() {
  const orders = await getMyOrders();

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline shrink-0">Second <span className="text-coral">App</span></Link>
          <div className="w-px h-5 bg-border" />
          <span className="text-[12px] font-medium text-text-muted">My Orders</span>
        </div>
      </header>

      <main className="mx-auto max-w-[800px] px-4 sm:px-6 py-6">
        <h1 className="text-xl font-bold text-text-primary mb-5">My Orders</h1>

        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="block no-underline">
                <div className="bg-card border border-border rounded-[10px] px-4 py-3.5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-semibold text-text-primary">{order.productName}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${STATUS_COLORS[order.orderStatus] || "bg-input text-text-muted"}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-text-muted">
                    <span>Sold by {order.vendorName}</span>
                    <span className="font-bold text-text-primary">{formatPrice(order.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-text-faint">
                    <span>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {order.orderStatus === "delivered" && !order.hasReview && (
                      <span className="text-coral font-semibold">Leave a review →</span>
                    )}
                    {order.trackingNumber && <span>Tracking: {order.trackingNumber}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm font-semibold text-text-secondary mb-1">No orders yet</p>
            <p className="text-[13px] text-text-muted mb-4">Start shopping to see your orders here</p>
            <Link href="/" className="inline-block px-5 py-2 rounded-lg bg-coral text-white text-sm font-semibold no-underline">Browse Products</Link>
          </div>
        )}
      </main>
    </div>
  );
}
