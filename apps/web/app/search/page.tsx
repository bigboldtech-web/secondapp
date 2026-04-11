import Link from "next/link";
import { searchListings } from "@/lib/db";
import SearchPageClient from "./SearchPageClient";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q || "";

  const listings = query ? await searchListings(query, { limit: 50 }) : [];

  return <SearchPageClient query={query} listings={listings} />;
}
