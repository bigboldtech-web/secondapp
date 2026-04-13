import { prisma } from "@second-app/database";
import { Prisma } from "@prisma/client";
import type { ListingCardData } from "../types";
import { parsePhotos, parseSpecs } from "../utils";
import { normalize } from "./algorithms";

export interface FullTextSearchFilters {
  categorySlug?: string | null;
  city?: string | null;
  condition?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  limit?: number;
  offset?: number;
}

interface Row {
  id: string;
  title: string;
  price: number;
  originalPrice: number | null;
  condition: string;
  specs: string | null;
  photos: string | null;
  vendorName: string;
  vendorSlug: string;
  vendorCertification: string;
  productSlug: string;
  categorySlug: string;
  location: string | null;
  createdAt: Date;
  isFeatured: boolean;
  adminCertified: boolean;
  score: number;
}

const TRIGRAM_THRESHOLD = 0.25;
const DEFAULT_LIMIT = 50;

export async function fullTextSearch(
  rawQuery: string,
  filters: FullTextSearchFilters = {}
): Promise<ListingCardData[]> {
  const q = normalize(rawQuery);
  if (!q || q.length < 2) return [];

  const limit = Math.min(filters.limit ?? DEFAULT_LIMIT, 100);
  const offset = Math.max(filters.offset ?? 0, 0);

  const clauses: Prisma.Sql[] = [Prisma.sql`l."status" = 'active'`];

  if (filters.categorySlug) {
    clauses.push(Prisma.sql`c."slug" = ${filters.categorySlug}`);
  }
  if (filters.city) {
    clauses.push(Prisma.sql`v."locationCity" = ${filters.city}`);
  }
  if (filters.condition) {
    clauses.push(Prisma.sql`l."condition" = ${filters.condition}`);
  }
  if (filters.minPrice != null) {
    clauses.push(Prisma.sql`l."price" >= ${Math.round(filters.minPrice * 100)}`);
  }
  if (filters.maxPrice != null) {
    clauses.push(Prisma.sql`l."price" <= ${Math.round(filters.maxPrice * 100)}`);
  }

  const where = Prisma.sql`WHERE ${Prisma.join(clauses, " AND ")}`;

  const rows = await prisma.$queryRaw<Row[]>`
    SELECT
      l."id"                                             AS "id",
      p."displayName"                                    AS "title",
      l."price"                                          AS "price",
      l."originalPrice"                                  AS "originalPrice",
      l."condition"                                      AS "condition",
      l."specs"                                          AS "specs",
      l."photos"                                         AS "photos",
      v."storeName"                                      AS "vendorName",
      v."storeSlug"                                      AS "vendorSlug",
      v."certificationLevel"                             AS "vendorCertification",
      p."slug"                                           AS "productSlug",
      c."slug"                                           AS "categorySlug",
      v."locationCity"                                   AS "location",
      l."createdAt"                                      AS "createdAt",
      l."isFeatured"                                     AS "isFeatured",
      l."adminCertified"                                 AS "adminCertified",
      (
        ts_rank_cd(l."searchVector", websearch_to_tsquery('english', ${q}), 32) * 1.0
        + GREATEST(similarity(l."searchText", ${q}) - ${TRIGRAM_THRESHOLD}, 0) * 2.0
        + CASE WHEN l."adminCertified" THEN 0.3 ELSE 0 END
        + CASE WHEN l."isFeatured"     THEN 0.2 ELSE 0 END
        + 0.25 * exp(-extract(epoch FROM (now() - l."createdAt")) / (30 * 86400.0))
        + GREATEST(COALESCE(v."ratingAvg", 3.5) - 3.5, 0) * 0.1
        + CASE v."certificationLevel"
            WHEN 'premium' THEN 0.2
            WHEN 'trusted' THEN 0.15
            WHEN 'verified' THEN 0.05
            ELSE 0
          END
      ) AS "score"
    FROM "Listing" l
    JOIN "Vendor"   v ON v."id" = l."vendorId"
    JOIN "Product"  p ON p."id" = l."productId"
    JOIN "Category" c ON c."id" = p."categoryId"
    ${where}
    AND (
      l."searchVector" @@ websearch_to_tsquery('english', ${q})
      OR similarity(l."searchText", ${q}) > ${TRIGRAM_THRESHOLD}
    )
    ORDER BY "score" DESC, l."createdAt" DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    price: r.price,
    originalPrice: r.originalPrice,
    condition: r.condition,
    specs: parseSpecs(r.specs),
    thumbnail: parsePhotos(r.photos)[0] ?? null,
    vendorName: r.vendorName,
    vendorSlug: r.vendorSlug,
    vendorCertification: r.vendorCertification,
    productSlug: r.productSlug,
    categorySlug: r.categorySlug,
    location: r.location || "India",
    createdAt: r.createdAt,
    isFeatured: r.isFeatured,
    adminCertified: r.adminCertified,
  }));
}

export async function fullTextSearchBroad(
  rawQuery: string,
  filters: FullTextSearchFilters = {}
): Promise<ListingCardData[]> {
  return fullTextSearch(rawQuery, {
    categorySlug: filters.categorySlug,
    city: filters.city,
    limit: filters.limit,
    offset: filters.offset,
  });
}
