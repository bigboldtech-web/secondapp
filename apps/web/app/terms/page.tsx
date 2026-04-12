import Link from "next/link";

export default function TermsPage() {
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
        <h1 className="text-2xl font-bold text-text-primary mb-4">Terms of Service</h1>
        <div className="text-[13px] text-text-secondary leading-relaxed space-y-3 bg-card border border-border rounded-[10px] px-5 py-5">
          <p>By using Second App (gosecond.in), you agree to these terms.</p>
          <p><strong>Accounts.</strong> You must provide accurate information when registering. One account per person. Vendors must complete KYC verification before listing products.</p>
          <p><strong>Listings.</strong> Vendors are responsible for the accuracy of their listings. Products must be legally owned and accurately described. Second App reserves the right to remove listings that violate our policies.</p>
          <p><strong>Payments.</strong> Online payments are held in escrow until the buyer confirms delivery. Cash-on-delivery orders are settled directly between buyer and vendor.</p>
          <p><strong>Returns.</strong> Disputes are mediated by our team. If a product is significantly different from its listing description, the buyer may request a refund within 48 hours of delivery.</p>
          <p><strong>Liability.</strong> Second App is a marketplace platform. We do not own or inspect the products listed. We are not liable for the condition or authenticity of items beyond what our certification process covers.</p>
          <p className="text-text-muted text-[11px]">Last updated: April 2026</p>
        </div>
      </main>
    </div>
  );
}
