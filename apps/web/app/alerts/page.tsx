import { getMyAlerts } from "@/app/actions";
import AlertsPageClient from "./AlertsPageClient";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const alerts = await getMyAlerts();
  return <AlertsPageClient alerts={alerts} />;
}
