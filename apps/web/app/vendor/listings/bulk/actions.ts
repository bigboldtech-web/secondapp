"use server";

import { prisma } from "@second-app/database";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface CsvRow {
  brandSlug: string;
  modelSlug: string;
  condition: string;
  price: number;
  originalPrice?: number;
  quantity?: number;
  description?: string;
  specs?: Record<string, string>;
}

export async function bulkCreateListings(categoryId: string, rows: CsvRow[]) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return { error: "Vendor account required" };
  if (vendor.subscriptionPlan === "free") return { error: "Bulk upload requires Pro or Business plan" };

  if (rows.length === 0) return { error: "No rows to process" };
  if (rows.length > 200) return { error: "Maximum 200 rows per upload" };

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 for 1-indexed + header row

    try {
      const brand = await prisma.brand.findFirst({
        where: { slug: row.brandSlug, categoryId },
      });
      if (!brand) {
        errors.push(`Row ${rowNum}: brand "${row.brandSlug}" not found`);
        skipped++;
        continue;
      }

      const model = await prisma.model.findFirst({
        where: { slug: row.modelSlug, brandId: brand.id },
      });
      if (!model) {
        errors.push(`Row ${rowNum}: model "${row.modelSlug}" not found`);
        skipped++;
        continue;
      }

      let product = await prisma.product.findFirst({
        where: { categoryId, brandId: brand.id, modelId: model.id },
      });
      if (!product) {
        const slug = `${brand.slug}-${model.slug}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
        product = await prisma.product.create({
          data: { categoryId, brandId: brand.id, modelId: model.id, slug, displayName: model.name },
        });
      }

      if (!row.price || row.price <= 0) {
        errors.push(`Row ${rowNum}: invalid price`);
        skipped++;
        continue;
      }

      const autoApprove = vendor.certificationLevel === "trusted" || vendor.certificationLevel === "premium";

      await prisma.listing.create({
        data: {
          productId: product.id,
          vendorId: vendor.id,
          specs: row.specs ? JSON.stringify(row.specs) : null,
          condition: row.condition || "Good",
          price: Math.round(row.price * 100),
          originalPrice: row.originalPrice ? Math.round(row.originalPrice * 100) : null,
          quantity: Math.max(1, Math.min(row.quantity ?? 1, 999)),
          description: row.description || null,
          status: autoApprove ? "active" : "pending",
        },
      });

      created++;
    } catch (err) {
      errors.push(`Row ${rowNum}: ${err instanceof Error ? err.message : "unknown error"}`);
      skipped++;
    }
  }

  if (created > 0) {
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { totalListings: { increment: created } },
    });
    revalidatePath("/vendor/listings/manage");
  }

  return { created, skipped, errors: errors.slice(0, 20) };
}
