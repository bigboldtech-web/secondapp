import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getMyCollections } from "./actions";
import CollectionsClient from "./CollectionsClient";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const collections = await getMyCollections();

  return <CollectionsClient collections={collections} />;
}
