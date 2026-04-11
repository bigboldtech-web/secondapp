import { redirect } from "next/navigation";
import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import VendorOrdersClient from "./VendorOrdersClient";

export const dynamic = "force-dynamic";

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

function parseAddress(json: string | null): ShippingAddress | null {
  if (!json) return null;
  try {
    const p = JSON.parse(json);
    if (typeof p === "object" && p && "address" in p) return p as ShippingAddress;
  } catch {
    /* noop */
  }
  return null;
}

export default async function VendorOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) redirect("/vendor/register");

  const orders = await prisma.order.findMany({
    where: { vendorId: vendor.id },
    include: {
      listing: { include: { product: { select: { displayName: true } } } },
      buyer: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = orders.map((o) => ({
    id: o.id,
    productName: o.listing.product.displayName,
    listingId: o.listingId,
    buyerName: o.buyer.name,
    buyerPhone: o.buyer.phone || "",
    amount: o.amount,
    commissionAmount: o.commissionAmount,
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    trackingNumber: o.trackingNumber,
    shippingAddress: parseAddress(o.shippingAddress),
    createdAt: o.createdAt.toISOString(),
  }));

  return <VendorOrdersClient orders={serialized} />;
}
