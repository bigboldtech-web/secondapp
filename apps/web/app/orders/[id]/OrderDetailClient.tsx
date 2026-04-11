"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { confirmDelivery, cancelOrder } from "../actions";
import { submitReview } from "@/app/reviews/actions";

interface OrderData {
  id: string;
  productName: string;
  productSlug: string;
  vendorName: string;
  vendorSlug: string;
  amount: number;
  orderStatus: string;
  paymentStatus: string;
  trackingNumber: string | null;
  shippingAddress: { name: string; phone: string; address: string; city: string; pincode: string } | null;
  hasReview: boolean;
  review: { id: string; rating: number; comment: string | null } | null;
  createdAt: string;
}

const formatPrice = (paise: number) => "₹" + Math.round(paise / 100).toLocaleString("en-IN");

const STATUS_STEPS = ["placed", "confirmed", "shipped", "delivered"];

export default function OrderDetailClient({ order }: { order: OrderData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(order.hasReview);

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[700px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/orders" className="text-text-muted no-underline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </Link>
          <span className="text-[14px] font-semibold text-text-primary">Order Details</span>
        </div>
      </header>

      <main className="mx-auto max-w-[700px] px-4 sm:px-6 py-6">
        {/* Product info */}
        <div className="bg-card border border-border rounded-[10px] px-4 py-4 mb-4">
          <Link href={`/product/${order.productSlug}`} className="text-[16px] font-bold text-text-primary no-underline hover:text-coral">
            {order.productName}
          </Link>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[12px] text-text-muted">Sold by <Link href={`/store/${order.vendorSlug}`} className="text-coral no-underline">{order.vendorName}</Link></span>
            <span className="text-[16px] font-bold text-text-primary">{formatPrice(order.amount)}</span>
          </div>
        </div>

        {/* Status timeline */}
        {!isCancelled && (
          <div className="bg-card border border-border rounded-[10px] px-4 py-4 mb-4">
            <h3 className="text-[13px] font-bold text-text-primary mb-4">Order Status</h3>
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    i <= currentStep ? "bg-condition-likenew-bg text-condition-likenew-text" : "bg-input text-text-muted"
                  }`}>
                    {i <= currentStep ? "✓" : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1 capitalize ${i <= currentStep ? "text-condition-likenew-text font-semibold" : "text-text-muted"}`}>{step}</span>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`absolute h-px w-full ${i < currentStep ? "bg-condition-likenew-text" : "bg-border"}`} style={{ display: "none" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="bg-condition-rough-bg border border-[#fecaca] rounded-[10px] px-4 py-3 mb-4 text-center">
            <p className="text-[14px] font-semibold text-condition-rough-text">Order Cancelled</p>
            <p className="text-[12px] text-condition-rough-text/70">Refund will be processed within 5-7 business days</p>
          </div>
        )}

        {/* Tracking */}
        {order.trackingNumber && (
          <div className="bg-card border border-border rounded-[10px] px-4 py-3 mb-4">
            <p className="text-[11px] text-text-muted uppercase tracking-wide mb-1">Tracking Number</p>
            <p className="text-[14px] font-mono font-semibold text-text-primary">{order.trackingNumber}</p>
          </div>
        )}

        {/* Shipping address */}
        {order.shippingAddress && (
          <div className="bg-card border border-border rounded-[10px] px-4 py-3 mb-4">
            <p className="text-[11px] text-text-muted uppercase tracking-wide mb-1">Delivery Address</p>
            <p className="text-[13px] font-medium text-text-primary">{order.shippingAddress.name}</p>
            <p className="text-[12px] text-text-secondary">{order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.pincode}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mb-4">
          {order.orderStatus === "shipped" && (
            <button
              onClick={async () => { setLoading(true); await confirmDelivery(order.id); router.refresh(); }}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-condition-likenew-bg text-condition-likenew-text text-[13px] font-semibold border-none cursor-pointer disabled:opacity-50"
            >
              Confirm Delivery
            </button>
          )}
          {order.orderStatus === "placed" && (
            <button
              onClick={async () => { setLoading(true); await cancelOrder(order.id); router.refresh(); }}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-condition-rough-bg text-condition-rough-text text-[13px] font-semibold border-none cursor-pointer disabled:opacity-50"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Review section */}
        {order.orderStatus === "delivered" && !reviewSubmitted && (
          <div className="bg-card border border-border rounded-[10px] px-4 py-4 mb-4">
            {!showReview ? (
              <button onClick={() => setShowReview(true)} className="w-full py-2.5 rounded-lg bg-coral text-white text-[13px] font-semibold border-none cursor-pointer">
                Leave a Review
              </button>
            ) : (
              <>
                <h3 className="text-[13px] font-bold text-text-primary mb-3">Rate your experience</h3>
                <div className="flex gap-1 mb-3 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl bg-transparent border-none cursor-pointer ${star <= rating ? "text-[#facc15]" : "text-[#ddd]"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience (optional)"
                  rows={3}
                  className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary resize-none mb-3"
                />
                <button
                  onClick={async () => {
                    setLoading(true);
                    await submitReview({ orderId: order.id, rating, comment: comment || undefined });
                    setReviewSubmitted(true);
                    setShowReview(false);
                    setLoading(false);
                  }}
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-coral text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Review"}
                </button>
              </>
            )}
          </div>
        )}

        {reviewSubmitted && order.review && (
          <div className="bg-condition-likenew-bg border border-[#bbf7d0] rounded-[10px] px-4 py-3 mb-4">
            <p className="text-[13px] font-semibold text-condition-likenew-text">
              Your review: {"★".repeat(order.review.rating)} {order.review.rating}/5
            </p>
            {order.review.comment && <p className="text-[12px] text-condition-likenew-text/80 mt-0.5">{order.review.comment}</p>}
          </div>
        )}

        {/* Order info */}
        <div className="text-[11px] text-text-faint text-center mt-4">
          Order ID: {order.id} · Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </main>
    </div>
  );
}
