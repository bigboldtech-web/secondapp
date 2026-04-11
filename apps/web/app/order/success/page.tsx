import Link from "next/link";
import { prisma } from "@second-app/database";

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const { orderId } = await searchParams;

  let orderDisplay = orderId || `SA${Date.now().toString().slice(-8)}`;

  // Try to get real order
  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: { include: { product: { select: { displayName: true } } } } },
    });
    if (order) {
      orderDisplay = order.id.slice(-8).toUpperCase();
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6 h-[52px] flex items-center">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">
            Second <span className="text-coral">App</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-[440px]">
          <div className="w-20 h-20 rounded-full bg-condition-likenew-bg flex items-center justify-center mx-auto mb-5">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-2">Order Placed!</h1>
          <p className="text-[14px] text-text-secondary mb-1">Your order has been placed successfully.</p>
          <p className="text-[13px] text-text-muted mb-6">
            Order ID: <span className="font-mono font-semibold text-text-primary">SA{orderDisplay}</span>
          </p>

          <div className="bg-card border border-border rounded-[10px] px-5 py-4 mb-6 text-left">
            <h3 className="text-[13px] font-bold text-text-primary mb-3">What happens next?</h3>
            <div className="space-y-3">
              {[
                { step: "1", title: "Seller confirms", desc: "The seller will confirm your order within 24 hours" },
                { step: "2", title: "Product ships", desc: "The product will be shipped with tracking details" },
                { step: "3", title: "Delivery & verification", desc: "Record an unboxing video when you receive the product" },
                { step: "4", title: "Payment released", desc: "After you verify, the escrow payment is released to the seller" },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-coral-light flex items-center justify-center text-[11px] font-bold text-coral shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-text-primary">{item.title}</p>
                    <p className="text-[11px] text-text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link href="/" className="px-5 py-2.5 rounded-lg border border-border bg-white text-sm font-semibold text-text-primary no-underline">
              Continue Shopping
            </Link>
            {orderId && (
              <Link href={`/orders/${orderId}`} className="px-5 py-2.5 rounded-lg bg-coral text-white text-sm font-semibold no-underline">
                Track Order
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
