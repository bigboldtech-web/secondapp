import { prisma } from "@second-app/database";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [
    totalUsers,
    totalVendors,
    totalListings,
    activeListings,
    pendingListings,
    totalOrders,
    pendingVendors,
    recentListings,
    recentVendors,
    catalogCategories,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.vendor.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "active" } }),
    prisma.listing.count({ where: { status: "pending" } }),
    prisma.order.count(),
    prisma.vendor.count({ where: { kycStatus: "pending" } }),
    prisma.listing.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { displayName: true } },
        vendor: { select: { storeName: true } },
      },
    }),
    prisma.vendor.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { brands: true, products: true } },
      },
    }),
    prisma.order.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        listing: { include: { product: { select: { displayName: true } } } },
        buyer: { select: { name: true } },
        vendor: { select: { storeName: true } },
      },
    }),
  ] as const);

  return (
    <AdminDashboard
      stats={{
        totalUsers,
        totalVendors,
        totalListings,
        activeListings,
        pendingListings,
        totalOrders,
        pendingVendors,
      }}
      recentListings={recentListings.map((l) => ({
        id: l.id,
        productName: l.product.displayName,
        vendorName: l.vendor.storeName,
        price: l.price,
        condition: l.condition,
        status: l.status,
        createdAt: l.createdAt.toISOString(),
      }))}
      recentVendors={recentVendors.map((v) => ({
        id: v.id,
        storeName: v.storeName,
        ownerName: v.user.name,
        email: v.user.email || "",
        kycStatus: v.kycStatus,
        certificationLevel: v.certificationLevel,
        totalSales: v.totalSales,
        createdAt: v.createdAt.toISOString(),
      }))}
      catalogCategories={catalogCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        sortOrder: c.sortOrder,
        brandCount: c._count.brands,
        productCount: c._count.products,
      }))}
      recentOrders={recentOrders.map((o) => ({
        id: o.id,
        productName: o.listing.product.displayName,
        buyerName: o.buyer.name,
        vendorName: o.vendor.storeName,
        amount: o.amount,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt.toISOString(),
      }))}
    />
  );
}
