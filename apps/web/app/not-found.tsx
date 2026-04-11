import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-text-faint mb-2">404</h1>
      <p className="text-lg font-semibold text-text-primary mb-1">Page not found</p>
      <p className="text-[13px] text-text-muted mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Link href="/" className="px-5 py-2.5 rounded-lg bg-coral text-white text-sm font-semibold no-underline">
        Back to Home
      </Link>
    </div>
  );
}
