import { redirect, notFound } from "next/navigation";
import { getListingForEdit } from "@/app/actions";
import { getSession } from "@/lib/auth";
import ListingEditForm from "./ListingEditForm";

export const dynamic = "force-dynamic";

export default async function ListingEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const listing = await getListingForEdit(id);
  if ("error" in listing) {
    if (listing.error === "Not your listing" || listing.error === "Listing not found") notFound();
    redirect("/vendor/register");
  }

  return <ListingEditForm listing={listing} />;
}
