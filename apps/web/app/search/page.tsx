import { redirect } from "next/navigation";
import { searchListings } from "@/lib/db";
import { resolveQuery, logQuery } from "@/lib/search";
import { getSession } from "@/lib/auth";
import SearchPageClient from "./SearchPageClient";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q || "";

  if (!query) return <SearchPageClient query={query} listings={[]} correctedFrom={null} />;

  // Resolve against the in-house vocabulary — redirects to a product/category page
  // when there's an exact catalog hit, otherwise returns the spell-corrected form.
  const resolved = await resolveQuery(query);
  if (resolved.redirectPath) redirect(resolved.redirectPath);

  const effectiveQuery = resolved.corrected ?? query;
  const listings = await searchListings(effectiveQuery, { limit: 50 });

  // Log for the vocabulary rebuild — fire and forget.
  const session = await getSession();
  void logQuery({ query, userId: session?.userId, resultCount: listings.length });

  return (
    <SearchPageClient
      query={query}
      listings={listings}
      correctedFrom={resolved.corrected ? query : null}
    />
  );
}
