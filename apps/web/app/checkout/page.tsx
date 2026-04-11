import { notFound } from "next/navigation";
import { getListingById } from "@/lib/db";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ listing?: string }> }) {
  const { listing: listingId } = await searchParams;

  if (!listingId) notFound();

  const listing = await getListingById(listingId);
  if (!listing) notFound();

  return <CheckoutClient listing={listing} />;
}
