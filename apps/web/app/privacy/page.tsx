import Link from "next/link";

export default function PrivacyPage() {
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
        <h1 className="text-2xl font-bold text-text-primary mb-4">Privacy Policy</h1>
        <div className="text-[13px] text-text-secondary leading-relaxed space-y-3 bg-card border border-border rounded-[10px] px-5 py-5">
          <p>Second App (operated by BigBold Technologies, gosecond.in) collects only the information needed to provide the marketplace service.</p>
          <p><strong>What we collect.</strong> Phone number (for OTP login), name, email (optional), city, and transaction data. Vendors additionally provide KYC documents (Aadhaar/PAN/GST) for verification.</p>
          <p><strong>How we use it.</strong> Authentication, order processing, notifications, and platform improvement. We do not sell personal data to third parties.</p>
          <p><strong>Storage.</strong> Data is stored on encrypted servers. KYC documents are stored securely and accessed only by our verification team.</p>
          <p><strong>Cookies.</strong> We use a session cookie (sa_session) for login persistence. No third-party tracking cookies.</p>
          <p><strong>Your rights.</strong> You can request deletion of your account and associated data by contacting support.</p>
          <p className="text-text-muted text-[11px]">Last updated: April 2026</p>
        </div>
      </main>
    </div>
  );
}
