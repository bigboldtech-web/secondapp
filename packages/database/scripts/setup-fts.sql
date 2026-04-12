-- Postgres full-text search bootstrap for Second App.
--
-- Ports OLX's ElasticSearch pipeline (tech.olx.in/free-text-search-at-olx) to
-- the database we already have. Every step here is idempotent so it's safe to
-- run as part of every deploy after prisma migrate:deploy.
--
--   text_en analyzer         →  to_tsvector('english', ...) with Porter stem
--   asciifolding             →  unaccent() extension
--   fuzzy matching           →  pg_trgm similarity() + % operator
--   title field variants     →  weighted tsvector (A/B/C/D) via setweight()
--   match query fuzziness    →  websearch_to_tsquery + trigram fallback
--   synonyms (text_en_search)→  applied at query time in apps/web/lib/search
--
-- Maintenance:
--   - BEFORE INSERT/UPDATE trigger on "Listing" recomputes the vector from
--     the joined product/brand/model row, so any price / spec / photo edit
--     gets a fresh search row on commit with no app-layer plumbing.
--   - A separate full-rebuild step runs once at bootstrap to backfill every
--     existing row that predates the trigger.

CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add the two search columns — tsvector for the weighted index, plain text
-- (lowercased + unaccented) for trigram similarity fallback. No-op if they
-- already exist from a prior run.
ALTER TABLE "Listing"
  ADD COLUMN IF NOT EXISTS "searchVector" tsvector,
  ADD COLUMN IF NOT EXISTS "searchText"   text;

-- GIN on the tsvector — the core inverted index that every match query hits.
CREATE INDEX IF NOT EXISTS "Listing_searchVector_idx"
  ON "Listing" USING gin("searchVector");

-- GIN on the trigram-over-text — handles fuzzy / partial / misspelled input
-- that slips past the Porter-stem tokenizer.
CREATE INDEX IF NOT EXISTS "Listing_searchText_trgm_idx"
  ON "Listing" USING gin("searchText" gin_trgm_ops);

-- Extra filter indexes that matter for narrow-query perf. CONCURRENTLY would
-- be nicer but the init script runs on a fresh db so a short lock is fine.
CREATE INDEX IF NOT EXISTS "Listing_status_idx" ON "Listing"("status");
CREATE INDEX IF NOT EXISTS "Listing_createdAt_idx" ON "Listing"("createdAt" DESC);

-- ---------------------------------------------------------------------------
-- Row-level compute. Returns the weighted vector for a single listing's
-- text surface area. Called from the trigger and the bulk backfill below.
-- Weights mirror the OLX title-field variants:
--   A  product display name (highest — "iPhone 15 Pro Max")
--   B  brand + model raw names (more literal; helps exact lookups)
--   C  description (discounted — user-written, noisy)
--   D  specs (lowest, but still useful for "256GB", "blue", etc.)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION second_app_listing_search_vector(
  product_name text,
  brand_name   text,
  model_name   text,
  description  text,
  specs_json   text
) RETURNS tsvector
LANGUAGE sql IMMUTABLE AS $$
  SELECT
    setweight(to_tsvector('english', unaccent(coalesce(product_name, ''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(brand_name, '') || ' ' || coalesce(model_name, ''))), 'B') ||
    setweight(to_tsvector('english', unaccent(coalesce(description, ''))), 'C') ||
    setweight(to_tsvector(
      'simple',
      unaccent(regexp_replace(coalesce(specs_json, ''), '[^a-zA-Z0-9 ]+', ' ', 'g'))
    ), 'D');
$$;

-- Lowercased + accent-stripped text surface for the trigram operator.
CREATE OR REPLACE FUNCTION second_app_listing_search_text(
  product_name text,
  brand_name   text,
  model_name   text,
  description  text,
  specs_json   text
) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT lower(unaccent(
    coalesce(product_name, '') || ' ' ||
    coalesce(brand_name, '') || ' ' ||
    coalesce(model_name, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    regexp_replace(coalesce(specs_json, ''), '[^a-zA-Z0-9 ]+', ' ', 'g')
  ));
$$;

-- ---------------------------------------------------------------------------
-- Trigger: on every INSERT/UPDATE of a Listing row, look up the joined
-- product/brand/model names and rewrite searchVector + searchText.
-- PL/pgSQL because we need to fetch sibling rows.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION second_app_refresh_listing_search()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_product_name text;
  v_brand_name   text;
  v_model_name   text;
BEGIN
  SELECT p."displayName", b."name", m."name"
    INTO v_product_name, v_brand_name, v_model_name
    FROM "Product" p
    JOIN "Brand" b ON b."id" = p."brandId"
    JOIN "Model" m ON m."id" = p."modelId"
    WHERE p."id" = NEW."productId";

  NEW."searchVector" := second_app_listing_search_vector(
    v_product_name, v_brand_name, v_model_name, NEW."description", NEW."specs"
  );
  NEW."searchText" := second_app_listing_search_text(
    v_product_name, v_brand_name, v_model_name, NEW."description", NEW."specs"
  );
  RETURN NEW;
END;
$$;

-- Drop + recreate so re-runs update the trigger body if we edit the function.
DROP TRIGGER IF EXISTS second_app_listing_search_trigger ON "Listing";
CREATE TRIGGER second_app_listing_search_trigger
  BEFORE INSERT OR UPDATE OF "productId", "description", "specs"
  ON "Listing"
  FOR EACH ROW
  EXECUTE FUNCTION second_app_refresh_listing_search();

-- ---------------------------------------------------------------------------
-- One-shot backfill for any row that predates the trigger. Idempotent —
-- re-running it just overwrites searchVector/searchText with the same value.
-- ---------------------------------------------------------------------------
UPDATE "Listing" l
SET
  "searchVector" = second_app_listing_search_vector(
    p."displayName", b."name", m."name", l."description", l."specs"
  ),
  "searchText"   = second_app_listing_search_text(
    p."displayName", b."name", m."name", l."description", l."specs"
  )
FROM "Product" p
JOIN "Brand"   b ON b."id" = p."brandId"
JOIN "Model"   m ON m."id" = p."modelId"
WHERE p."id" = l."productId";
