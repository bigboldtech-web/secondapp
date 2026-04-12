import Link from "next/link";

export default function AboutPage() {
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
        <h1 className="text-2xl font-bold text-text-primary mb-4">About Second App</h1>
        <div className="text-[14px] text-text-secondary leading-relaxed space-y-4">
          <p>
            Second App is India&apos;s trusted marketplace for certified pre-owned products. We connect buyers with verified dealers who specialize in second-hand electronics, vehicles, and accessories.
          </p>
          <p>
            Unlike classifieds where anyone can post anything, every vendor on Second App goes through KYC verification and our proprietary certification process. Products are grouped by model so you can instantly compare prices across sellers — and every listing requires real photos and an honest condition grade.
          </p>
          <p>
            Our mission is to make buying pre-owned feel as confident as buying new.
          </p>
        </div>
      </main>
    </div>
  );
}
