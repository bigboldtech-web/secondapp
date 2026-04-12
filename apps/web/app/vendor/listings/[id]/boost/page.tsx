import { redirect, notFound } from "next/navigation";
import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import BoostForm from "./BoostForm";

export const dynamic = "force-dynamic";

export default async function BoostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) redirect("/vendor/register");

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { product: { select: { displayName: true } } },
  });
  if (!listing || listing.vendorId !== vendor.id) notFound();

  return (
    <BoostForm
      listing={{
        id: listing.id,
        productName: listing.product.displayName,
        isPromoted: listing.isPromoted,
        promotedUntil: listing.promotedUntil?.toISOString() ?? null,
        isFeatured: listing.isFeatured,
      }}
    />
  );
}
