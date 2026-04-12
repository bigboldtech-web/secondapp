// Free-text search library. Ports the OLX ElasticSearch approach to
// Postgres' built-in FTS + trigram extensions. See packages/database/scripts/
// setup-fts.sql for the index bootstrap.
//
// Query pipeline — mirrors the OLX analyzer chain:
//   1. normalize input (lowercase + unaccent) — done in SQL via unaccent()
//   2. tokenize + stem via websearch_to_tsquery('english', q)
//   3. run two parallel matchers, union their scores:
//        a. tsvector @@ tsquery       (Porter-stemmed, stop-word filtered)
//        b. similarity(searchText, q) (trigram fuzzy for typos / partials)
//   4. multiply by business signals:
//        - admin certification (+0.3)
//        - featured flag (+0.2)
//        - freshness (exponential decay, 30-day half-life)
//        - vendor rating (±, centered on 3.5)
//        - vendor certification tier (trusted/premium +0.15)
//   5. apply filters (category, city, condition, price range)
//
// Synonym expansion is applied client-side by the suggest() helper. The
// SearchTerm vocabulary already captures the common misspellings per brand
// so we don't need a second OLX-style synonym_en filter on the Postgres side.

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

const TRIGRAM_THRESHOLD = 0.25; // similarity() >= this qualifies as a match
const DEFAULT_LIMIT = 50;

export async function fullTextSearch(
  rawQuery: string,
  filters: FullTextSearchFilters = {}
): Promise<ListingCardData[]> {
  const q = normalize(rawQuery);
  if (!q || q.length < 2) return [];

  const limit = Math.min(filters.limit ?? DEFAULT_LIMIT, 100);
  const offset = Math.max(filters.offset ?? 0, 0);

  // Filter fragments are built conditionally so untouched filters don't
  // drag empty WHERE clauses into the query. Prisma.sql handles the join.
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

  // Core relevance:
  //   ts_rank_cd covers the Porter-stemmed + weighted field match.
  //   similarity() covers trigram fuzzy — rescues typos that lose to Porter.
  //   exp(-age_days / 30) is OLX's freshness decay approximated for a year.
  //
  // We keep the text condition as an OR (match OR trigram) so fuzzy-only
  // hits still appear, but gate them on TRIGRAM_THRESHOLD so random noise
  // stays out of the result set.
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

// Zero-result recovery: if the strict query returns nothing, retry without
// the narrow filters (condition / price) to see whether the buyer would
// accept a broader match. Called by the search page when fullTextSearch()
// returns zero rows.
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
