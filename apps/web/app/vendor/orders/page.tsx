import Link from "next/link";
import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import VendorOrdersClient from "./VendorOrdersClient";

export const dynamic = "force-dynamic";

export default async function VendorOrdersPage() {
  const session = await getSession();
  if (!session) return <div className="p-8 text-center">Please log in</div>;

  const vendor = await prisma.vendor.findFirst({ where: { userId: session.userId } });
  if (!vendor) return <div className="p-8 text-center">Not a vendor</div>;

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
    buyerName: o.buyer.name,
    buyerPhone: o.buyer.phone || "",
    amount: o.amount,
    orderStatus: o.orderStatus,
    trackingNumber: o.trackingNumber,
    createdAt: o.createdAt.toISOString(),
  }));

  return <VendorOrdersClient orders={serialized} />;
}
