import { getListings, getCategoriesWithCounts } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Homepage from "@/components/Homepage";

export default async function Home() {
  const [listings, categories, session] = await Promise.all([
    getListings({ limit: 50 }),
    getCategoriesWithCounts(),
    getSession(),
  ]);

  return (
    <Homepage
      listings={listings}
      categories={categories}
      isLoggedIn={!!session}
      userName={session?.user?.name}
    />
  );
}
