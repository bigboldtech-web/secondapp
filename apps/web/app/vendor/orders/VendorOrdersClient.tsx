"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

interface VendorOrder {
  id: string;
  productName: string;
  listingId: string;
  buyerName: string;
  buyerPhone: string;
  amount: number;
  commissionAmount: number;
  orderStatus: string;
  paymentStatus: string;
  trackingNumber: string | null;
  shippingAddress: ShippingAddress | null;
  createdAt: string;
}

const formatPrice = (paise: number) => "₹" + Math.round(paise / 100).toLocaleString("en-IN");
const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const STATUS_STYLES: Record<string, string> = {
  placed: "bg-condition-good-bg text-condition-good-text",
  confirmed: "bg-condition-excellent-bg text-condition-excellent-text",
  shipped: "bg-condition-excellent-bg text-condition-excellent-text",
  delivered: "bg-condition-likenew-bg text-condition-likenew-text",
  cancelled: "bg-condition-rough-bg text-condition-rough-text",
  disputed: "bg-condition-rough-bg text-condition-rough-text",
};

const PAYMENT_LABELS: Record<string, { label: string; tone: string }> = {
  pending: { label: "Payment pending", tone: "bg-condition-good-bg text-condition-good-text" },
  held: { label: "Payment held (escrow)", tone: "bg-condition-excellent-bg text-condition-excellent-text" },
  released: { label: "Payment released", tone: "bg-condition-likenew-bg text-condition-likenew-text" },
  refunded: { label: "Refunded", tone: "bg-input text-text-muted" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "to-confirm", label: "To confirm" },
  { key: "to-ship", label: "To ship" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
] as const;
type FilterKey = typeof FILTERS[number]["key"];

function matchesFilter(order: VendorOrder, f: FilterKey): boolean {
  switch (f) {
    case "all": return true;
    case "to-confirm": return order.orderStatus === "placed";
    case "to-ship": return order.orderStatus === "confirmed";
    case "shipped": return order.orderStatus === "shipped";
    case "delivered": return order.orderStatus === "delivered";
    case "cancelled": return order.orderStatus === "cancelled";
  }
}

export default function VendorOrdersClient({ orders }: { orders: VendorOrder[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [trackingDraft, setTrackingDraft] = useState<Record<string, string>>({});
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      "all": orders.length,
      "to-confirm": 0,
      "to-ship": 0,
      "shipped": 0,
      "delivered": 0,
      "cancelled": 0,
    };
    for (const o of orders) {
      for (const f of FILTERS) {
        if (f.key !== "all" && matchesFilter(o, f.key)) c[f.key]++;
      }
    }
    return c;
  }, [orders]);

  const filtered = useMemo(() => orders.filter((o) => matchesFilter(o, filter)), [orders, filter]);

  const submit = async (orderId: string, action: "confirm" | "ship" | "cancel") => {
    setBusyId(orderId);
    setError(null);
    const body: Record<string, string> = { orderId, action };
    if (action === "ship") body.trackingNumber = trackingDraft[orderId] ?? "";
    const res = await fetch("/api/vendor/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      setError(json.error || "Something went wrong");
      return;
    }
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/vendor/dashboard" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">
            Second <span className="text-coral">App</span>
          </Link>
          <div className="w-px h-5 bg-border" />
          <span className="text-[12px] font-medium text-text-muted">Orders</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1140px] px-4 sm:px-6 py-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h1 className="text-xl font-bold text-text-primary">Incoming orders</h1>
          <p className="text-[11px] text-text-muted">
            Confirm within 24 hours to keep your response time healthy.
          </p>
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-md text-[12px] font-medium border cursor-pointer ${
                filter === f.key
                  ? "bg-coral text-white border-coral"
                  : "bg-white text-text-secondary border-border hover:bg-bg"
              }`}
            >
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 bg-condition-rough-bg text-condition-rough-text text-[12px] font-medium rounded-lg">
            {error}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm font-semibold text-text-secondary mb-1">No orders in this view</p>
            <p className="text-xs text-text-muted">New orders will appear here as buyers check out.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const pay = PAYMENT_LABELS[order.paymentStatus] ?? { label: order.paymentStatus, tone: "bg-input text-text-muted" };
              const canCancel = order.orderStatus === "placed" || order.orderStatus === "confirmed";
              return (
                <div key={order.id} className="bg-card border border-border rounded-[10px] px-4 py-4">
                  <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <Link href={`/listing/${order.listingId}`} className="text-[14px] font-semibold text-text-primary no-underline hover:text-coral truncate">
                          {order.productName}
                        </Link>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded capitalize ${STATUS_STYLES[order.orderStatus] ?? STATUS_STYLES.placed}`}>
                          {order.orderStatus}
                        </span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${pay.tone}`}>
                          {pay.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted">
                        Order #{order.id.slice(-8)} · {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[16px] font-bold text-text-primary">{formatPrice(order.amount)}</p>
                      <p className="text-[10px] text-text-muted">You net {formatPrice(order.amount - order.commissionAmount)}</p>
                    </div>
                  </div>

                  {order.shippingAddress && (
                    <div className="bg-bg border border-border rounded-md px-3 py-2 mb-3">
                      <p className="text-[10px] uppercase tracking-wide text-text-muted mb-0.5">Ship to</p>
                      <p className="text-[12px] text-text-primary font-medium">
                        {order.shippingAddress.name} · {order.shippingAddress.phone}
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        {order.shippingAddress.address}, {order.shippingAddress.city} — {order.shippingAddress.pincode}
                      </p>
                    </div>
                  )}

                  {order.trackingNumber && (
                    <p className="text-[11px] text-text-muted mb-3">
                      Tracking: <span className="font-mono text-text-secondary">{order.trackingNumber}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {order.orderStatus === "placed" && (
                      <button
                        onClick={() => submit(order.id, "confirm")}
                        disabled={busyId === order.id}
                        className="text-[11px] px-3 py-1.5 rounded-md bg-coral text-white font-semibold border-none cursor-pointer disabled:opacity-50"
                      >
                        {busyId === order.id ? "Confirming…" : "Confirm order"}
                      </button>
                    )}

                    {order.orderStatus === "confirmed" && (
                      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[240px]">
                        <input
                          type="text"
                          value={trackingDraft[order.id] ?? ""}
                          onChange={(e) => setTrackingDraft((prev) => ({ ...prev, [order.id]: e.target.value }))}
                          placeholder="Tracking number (optional)"
                          className="flex-1 min-w-[140px] px-2.5 py-1.5 text-[12px] border border-border rounded-md bg-white text-text-primary outline-none"
                        />
                        <button
                          onClick={() => submit(order.id, "ship")}
                          disabled={busyId === order.id}
                          className="text-[11px] px-3 py-1.5 rounded-md bg-coral text-white font-semibold border-none cursor-pointer disabled:opacity-50"
                        >
                          {busyId === order.id ? "Saving…" : "Mark shipped"}
                        </button>
                      </div>
                    )}

                    {canCancel && (
                      <button
                        onClick={() => setConfirmCancel(order.id)}
                        disabled={busyId === order.id}
                        className="text-[11px] px-3 py-1.5 rounded-md bg-white border border-border text-condition-rough-text font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {confirmCancel && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setConfirmCancel(null)}
        >
          <div className="bg-white rounded-lg max-w-sm w-full p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-text-primary mb-1">Cancel this order?</h3>
            <p className="text-[12px] text-text-muted mb-4">
              The buyer will be refunded and notified. The listing will return to active so someone else can buy it.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setConfirmCancel(null)}
                className="px-3 py-2 rounded-md border border-border text-[12px] text-text-primary bg-white cursor-pointer"
              >
                Keep order
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = confirmCancel;
                  setConfirmCancel(null);
                  if (id) await submit(id, "cancel");
                }}
                disabled={busyId === confirmCancel}
                className="px-3 py-2 rounded-md bg-condition-rough-text text-white text-[12px] font-semibold cursor-pointer disabled:opacity-50"
              >
                {busyId === confirmCancel ? "Cancelling…" : "Cancel order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
