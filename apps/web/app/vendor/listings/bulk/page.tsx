import { redirect } from "next/navigation";
import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import BulkUploadClient from "./BulkUploadClient";

export const dynamic = "force-dynamic";

export default async function BulkUploadPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) redirect("/vendor/register");

  if (vendor.subscriptionPlan === "free") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-[12px] px-6 py-8 max-w-md text-center">
          <h1 className="text-lg font-bold text-text-primary mb-2">Bulk upload requires Pro or Business</h1>
          <p className="text-[13px] text-text-muted mb-4">
            Upgrade your plan to upload multiple listings at once via CSV.
          </p>
          <a href="/vendor/subscription" className="px-5 py-2.5 rounded-lg bg-coral text-white text-sm font-semibold no-underline inline-block">
            View plans
          </a>
        </div>
      </div>
    );
  }

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
    orderBy: { sortOrder: "asc" },
  });

  return <BulkUploadClient categories={categories} vendorId={vendor.id} plan={vendor.subscriptionPlan} />;
}
