import { redirect } from "next/navigation";
import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import StoreEditForm from "./StoreEditForm";

export const dynamic = "force-dynamic";

export default async function StoreEditPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) redirect("/vendor/register");

  return (
    <StoreEditForm
      initial={{
        storeName: vendor.storeName,
        storeSlug: vendor.storeSlug,
        bio: vendor.bio,
        locationCity: vendor.locationCity,
        logoUrl: vendor.logoUrl,
        bannerUrl: vendor.bannerUrl,
      }}
    />
  );
}
