import { getVendorListings } from "@/app/actions";
import VendorListingsClient from "./VendorListingsClient";

export const dynamic = "force-dynamic";

export default async function VendorListingsManagePage() {
  const listings = await getVendorListings();
  return <VendorListingsClient listings={listings} />;
}
