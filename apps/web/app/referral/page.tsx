import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getOrCreateReferralCode, getMyReferrals } from "./actions";
import ReferralClient from "./ReferralClient";

export const dynamic = "force-dynamic";

export default async function ReferralPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const codeResult = await getOrCreateReferralCode();
  if ("error" in codeResult) redirect("/login");

  const referrals = await getMyReferrals();

  return (
    <ReferralClient
      code={codeResult.code!}
      credits={codeResult.credits!}
      referrals={referrals.map((r) => ({
        id: r.id,
        friendName: r.referred.name,
        amount: r.creditAmount,
        status: r.status,
        date: r.createdAt.toISOString(),
      }))}
    />
  );
}
