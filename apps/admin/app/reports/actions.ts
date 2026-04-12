"use server";

import { prisma } from "@second-app/database";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function reviewReport(reportId: string, action: "reviewed" | "dismissed") {
  await requireAdmin();

  await prisma.listingReport.update({
    where: { id: reportId },
    data: { status: action },
  });

  // If reviewed (not dismissed), also reject the listing so it goes off the site.
  if (action === "reviewed") {
    const report = await prisma.listingReport.findUnique({
      where: { id: reportId },
      select: { listingId: true, reason: true },
    });
    if (report) {
      await prisma.listing.update({
        where: { id: report.listingId },
        data: { status: "rejected", rejectionReason: `Reported: ${report.reason}` },
      });
    }
  }

  revalidatePath("/reports");
  return { success: true };
}
