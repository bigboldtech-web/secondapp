import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-border">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">
            Second <span className="text-coral">App</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[800px] px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Help Center</h1>
        <div className="space-y-4">
          {[
            { q: "How do I buy a product?", a: "Browse listings, click 'Buy Now', fill in your shipping address and payment method, and confirm the order. The seller will be notified and confirm within 24 hours." },
            { q: "How do I set a deal alert?", a: "Go to any product page and click 'Set Alert'. You'll be notified when a new listing matches your criteria." },
            { q: "How does payment protection work?", a: "When you pay online, your money is held in escrow until you confirm delivery. If there's a problem, our team mediates." },
            { q: "How do I become a vendor?", a: "Register at /vendor/register with your business details. Upload your KYC documents (Aadhaar/PAN/GST). Our team reviews applications within 48 hours." },
            { q: "How do I contact the seller?", a: "Click 'Ask a Question' on any listing page to start a chat with the vendor." },
          ].map(({ q, a }) => (
            <div key={q} className="bg-card border border-border rounded-[10px] px-4 py-3.5">
              <p className="text-[14px] font-semibold text-text-primary mb-1">{q}</p>
              <p className="text-[13px] text-text-secondary leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
