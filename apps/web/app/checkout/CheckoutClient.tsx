"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListingDetail } from "@/lib/types";
import { formatPrice, calcDiscount } from "@/lib/utils";
import { createOrder, confirmRazorpayPayment } from "./actions";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface CheckoutClientProps {
  listing: ListingDetail;
}

export default function CheckoutClient({ listing }: CheckoutClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<"address" | "payment" | "confirm">("address");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");
  const [placing, setPlacing] = useState(false);

  const discount = calcDiscount(listing.price, listing.originalPrice);
  const deliveryFee = listing.price > 50000 * 100 ? 0 : 9900; // Free above ₹50,000, else ₹99
  const total = listing.price + deliveryFee;

  const addressValid = name.trim() && phone.length === 10 && address.trim() && city.trim() && pincode.length === 6;

  const [orderError, setOrderError] = useState("");

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setOrderError("");
    const result = await createOrder({
      listingId: listing.id,
      shippingAddress: { name, phone, address, city, pincode },
      paymentMethod,
    });
    if (result.error) {
      setOrderError(result.error);
      setPlacing(false);
      return;
    }

    const needsGateway = paymentMethod !== "cod" && result.provider === "razorpay" && result.paymentOrderId && result.razorpayKeyId;

    if (!needsGateway) {
      router.push(`/order/success?orderId=${result.orderId}`);
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      setOrderError("Could not load payment gateway. Please retry.");
      setPlacing(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: result.razorpayKeyId,
      order_id: result.paymentOrderId,
      amount: result.amount,
      currency: "INR",
      name: "Second App",
      description: listing.product.displayName,
      prefill: { name, contact: phone },
      theme: { color: "#E8553D" },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const verify = await confirmRazorpayPayment({
          orderId: result.orderId!,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        if (verify.error) {
          setOrderError(verify.error);
          setPlacing(false);
          return;
        }
        router.push(`/order/success?orderId=${result.orderId}`);
      },
      modal: {
        ondismiss: () => {
          setOrderError("Payment cancelled. You can retry from your orders page.");
          setPlacing(false);
        },
      },
    });
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline shrink-0">
            Second <span className="text-coral">App</span>
          </Link>
          <div className="w-px h-5 bg-border" />
          <span className="text-[12px] font-medium text-text-muted">Secure Checkout</span>
          <div className="ml-auto flex items-center gap-1 text-[11px] text-text-muted">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            SSL Secured
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[800px] px-4 sm:px-6 py-6">
        {/* Progress steps */}
        <div className="flex items-center justify-center gap-0 mb-6">
          {(["address", "payment", "confirm"] as const).map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === s ? "bg-coral text-white" :
                  (["address", "payment", "confirm"].indexOf(step) > i) ? "bg-condition-likenew-bg text-condition-likenew-text" :
                  "bg-input text-text-muted"
                }`}>
                  {["address", "payment", "confirm"].indexOf(step) > i ? "✓" : i + 1}
                </div>
                <span className={`text-[9px] mt-0.5 capitalize ${step === s ? "text-coral font-semibold" : "text-text-muted"}`}>{s}</span>
              </div>
              {i < 2 && <div className={`w-12 sm:w-20 h-px mx-1.5 -mt-3 ${["address", "payment", "confirm"].indexOf(step) > i ? "bg-coral" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
          {/* Left: Forms */}
          <div>
            {step === "address" && (
              <div className="bg-card border border-border rounded-[10px] px-5 py-5">
                <h2 className="text-base font-bold text-text-primary mb-4">Delivery Address</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-text-secondary mb-1">Full Name *</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-text-secondary mb-1">Phone *</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit number" className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">Address *</label>
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House/flat no., street, locality" rows={2} className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-text-secondary mb-1">City *</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-text-secondary mb-1">Pincode *</label>
                      <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit pincode" className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary" />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setStep("payment")}
                  disabled={!addressValid}
                  className="w-full mt-5 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer bg-coral text-white disabled:bg-input disabled:text-text-muted disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === "payment" && (
              <div className="bg-card border border-border rounded-[10px] px-5 py-5">
                <h2 className="text-base font-bold text-text-primary mb-4">Payment Method</h2>
                <div className="space-y-2">
                  {([
                    { id: "upi" as const, label: "UPI", desc: "Pay via Google Pay, PhonePe, Paytm", icon: "📱" },
                    { id: "card" as const, label: "Credit/Debit Card", desc: "Visa, Mastercard, RuPay", icon: "💳" },
                    { id: "cod" as const, label: "Cash on Delivery", desc: "Pay when you receive the product", icon: "💵" },
                  ]).map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full p-3.5 rounded-lg border text-left cursor-pointer flex items-center gap-3 ${
                        paymentMethod === method.id ? "border-coral-border bg-coral-light" : "border-border bg-white hover:bg-bg"
                      }`}
                    >
                      <span className="text-xl">{method.icon}</span>
                      <div>
                        <p className={`text-sm font-semibold ${paymentMethod === method.id ? "text-coral" : "text-text-primary"}`}>{method.label}</p>
                        <p className="text-[11px] text-text-muted">{method.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="bg-condition-likenew-bg rounded-lg px-3 py-2.5 mt-4 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <p className="text-[11px] text-condition-likenew-text font-medium">
                    Your payment is protected by escrow. Money is held safely until you receive and verify the product.
                  </p>
                </div>

                <div className="flex gap-2 mt-5">
                  <button onClick={() => setStep("address")} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border bg-white text-text-primary cursor-pointer">
                    Back
                  </button>
                  <button onClick={() => setStep("confirm")} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border-none bg-coral text-white cursor-pointer">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {step === "confirm" && (
              <div className="bg-card border border-border rounded-[10px] px-5 py-5">
                <h2 className="text-base font-bold text-text-primary mb-4">Confirm Your Order</h2>

                {/* Delivery address summary */}
                <div className="border border-border rounded-lg px-3.5 py-3 mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Delivering to</p>
                    <button onClick={() => setStep("address")} className="text-[11px] text-coral font-medium bg-transparent border-none cursor-pointer">Change</button>
                  </div>
                  <p className="text-[13px] font-medium text-text-primary">{name}</p>
                  <p className="text-[12px] text-text-secondary">{address}, {city} - {pincode}</p>
                  <p className="text-[12px] text-text-muted">Phone: +91 {phone}</p>
                </div>

                {/* Payment summary */}
                <div className="border border-border rounded-lg px-3.5 py-3 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Payment</p>
                    <button onClick={() => setStep("payment")} className="text-[11px] text-coral font-medium bg-transparent border-none cursor-pointer">Change</button>
                  </div>
                  <p className="text-[13px] font-medium text-text-primary capitalize">
                    {paymentMethod === "upi" ? "UPI" : paymentMethod === "card" ? "Credit/Debit Card" : "Cash on Delivery"}
                  </p>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="w-full py-3 rounded-lg text-sm font-bold border-none bg-coral text-white cursor-pointer disabled:opacity-50"
                >
                  {placing ? "Placing Order..." : `Place Order — ${formatPrice(total)}`}
                </button>
              </div>
            )}
          </div>

          {/* Right: Order summary */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-[10px] px-4 py-4">
              <h3 className="text-[13px] font-bold text-text-primary mb-3">Order Summary</h3>

              <div className="flex gap-3 mb-3 pb-3 border-b border-border">
                <div className="w-16 h-16 bg-input rounded-lg flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#ccc">
                    <path d="M15.5 1h-8A2.5 2.5 0 005 3.5v17A2.5 2.5 0 007.5 23h8a2.5 2.5 0 002.5-2.5v-17A2.5 2.5 0 0015.5 1zm-4 21a1 1 0 110-2 1 1 0 010 2zm4.5-4H7V4h9v14z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-text-primary">{listing.product.displayName}</p>
                  <div className="flex gap-1 mt-0.5">
                    {Object.values(listing.specs).map((val) => (
                      <span key={val} className="text-[10px] text-text-muted bg-input-light px-1 py-px rounded">{val}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">
                    Condition: {listing.condition} · Sold by {listing.vendor.storeName}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Price</span>
                  <span className="text-text-primary font-medium">{formatPrice(listing.price)}</span>
                </div>
                {listing.originalPrice && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Discount</span>
                    <span className="text-condition-likenew-text font-medium">-{formatPrice(listing.originalPrice - listing.price)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-secondary">Delivery</span>
                  <span className={deliveryFee === 0 ? "text-condition-likenew-text font-medium" : "text-text-primary font-medium"}>
                    {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-text-primary font-bold">Total</span>
                  <span className="text-text-primary font-bold text-base">{formatPrice(total)}</span>
                </div>
              </div>

              {discount && (
                <div className="mt-3 bg-condition-likenew-bg rounded-lg px-3 py-1.5 text-[11px] text-condition-likenew-text font-medium text-center">
                  You save {formatPrice(listing.originalPrice! - listing.price)} ({discount}% off)
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
