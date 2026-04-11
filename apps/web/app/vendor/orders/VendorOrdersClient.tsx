"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface VendorOrder {
  id: string;
  productName: string;
  buyerName: string;
  buyerPhone: string;
  amount: number;
  orderStatus: string;
  trackingNumber: string | null;
  createdAt: string;
}

const formatPrice = (paise: number) => "₹" + Math.round(paise / 100).toLocaleString("en-IN");

export default function VendorOrdersClient({ orders }: { orders: VendorOrder[] }) {
  const router = useRouter();

  const handleAction = async (orderId: string, action: string, trackingNumber?: string) => {
    await fetch("/api/vendor/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, action, trackingNumber }),
    });
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/vendor/dashboard" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">Second <span className="text-coral">App</span></Link>
          <div className="w-px h-5 bg-border" />
          <span className="text-[12px] font-medium text-text-muted">Orders</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1140px] px-4 sm:px-6 py-5">
        <h1 className="text-xl font-bold text-text-primary mb-5">Incoming Orders</h1>

        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-[10px] px-4 py-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] font-semibold text-text-primary">{order.productName}</span>
                  <span className="text-[14px] font-bold text-text-primary">{formatPrice(order.amount)}</span>
                </div>
                <div className="flex items-center justify-between text-[12px] text-text-muted mb-2">
                  <span>Buyer: {order.buyerName}</span>
                  <span className="capitalize font-medium text-text-secondary">{order.orderStatus}</span>
                </div>
                <div className="flex gap-2">
                  {order.orderStatus === "placed" && (
                    <button onClick={() => handleAction(order.id, "confirm")} className="text-[11px] px-3 py-1.5 rounded-md bg-condition-likenew-bg text-condition-likenew-text font-semibold border-none cursor-pointer">
                      Confirm Order
                    </button>
                  )}
                  {order.orderStatus === "confirmed" && (
                    <button onClick={() => { const tn = prompt("Enter tracking number:"); if (tn) handleAction(order.id, "ship", tn); }} className="text-[11px] px-3 py-1.5 rounded-md bg-condition-excellent-bg text-condition-excellent-text font-semibold border-none cursor-pointer">
                      Mark Shipped
                    </button>
                  )}
                  {order.trackingNumber && (
                    <span className="text-[10px] text-text-muted self-center">Tracking: {order.trackingNumber}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-text-muted text-sm">No orders yet</p>
        )}
      </main>
    </div>
  );
}
