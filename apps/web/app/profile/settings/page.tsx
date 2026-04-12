import { redirect } from "next/navigation";
import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, locationCity: true },
  });
  if (!user) redirect("/login");

  return (
    <SettingsForm
      initial={{
        name: user.name,
        email: user.email ?? "",
        city: user.locationCity ?? "",
      }}
    />
  );
}
