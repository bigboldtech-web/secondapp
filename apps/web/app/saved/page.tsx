import { getMySavedListings } from "@/app/actions";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const savedListings = await getMySavedListings();

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline shrink-0">
            Second <span className="text-coral">App</span>
          </Link>
          <div className="w-px h-5 bg-border" />
          <span className="text-[12px] font-medium text-text-muted">Saved Items</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1140px] px-4 sm:px-6 py-6">
        <h1 className="text-xl font-bold text-text-primary mb-1">Saved Items</h1>
        <p className="text-[13px] text-text-muted mb-5">{savedListings.length} items</p>

        {savedListings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {savedListings.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-coral-light flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8553D" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-text-primary mb-1">Nothing saved yet</h2>
            <p className="text-[13px] text-text-muted mb-4">
              Tap the heart icon on any listing to save it here
            </p>
            <Link href="/" className="inline-block px-5 py-2 rounded-lg bg-coral text-white text-sm font-semibold no-underline">
              Browse Products
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
