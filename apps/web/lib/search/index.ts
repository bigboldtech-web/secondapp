import { prisma } from "@second-app/database";
import {
  normalize,
  tokenize,
  levenshtein,
  doubleMetaphone,
  scoreTerm,
} from "./algorithms";

export interface SuggestionResult {
  id: string;
  term: string;
  displayTerm: string;
  termType: string;
  categoryId: string | null;
  redirectPath: string | null;
  score: number;
}

export interface SearchResolution {
  original: string;
  corrected: string | null;
  redirectPath: string | null;
  matchedTermId: string | null;
}

const SUGGEST_LIMIT = 10;
const FUZZY_CAP = 2; // max edit distance tolerated

// ---------------------------------------------------------------------------
// suggest(q, categoryId?) — OLX-style 3-layer autosuggest pipeline.
//   Layer 1: exact prefix match on term
//   Layer 2: edit-distance <= FUZZY_CAP against same-prefix candidates
//   Layer 3: phonetic bucket match via Double Metaphone
// Results are ranked by OLX composite score (freq + 2*views + recency).
// ---------------------------------------------------------------------------
export async function suggest(rawQ: string, categoryId?: string | null): Promise<SuggestionResult[]> {
  const q = normalize(rawQ);
  if (q.length < 2) return [];

  const categoryFilter = categoryId ? { OR: [{ categoryId }, { categoryId: null }] } : {};

  // ---- Layer 1: exact prefix ----
  const exact = await prisma.searchTerm.findMany({
    where: {
      term: { startsWith: q },
      ...categoryFilter,
    },
    take: SUGGEST_LIMIT * 3, // over-fetch so scoring can pick the best
  });

  const results = new Map<string, SuggestionResult>();
  for (const t of exact) results.set(t.id, toResult(t));

  // ---- Layer 2: fuzzy (edit distance <= FUZZY_CAP) ----
  if (results.size < SUGGEST_LIMIT) {
    const firstChar = q[0];
    const candidates = await prisma.searchTerm.findMany({
      where: {
        term: { startsWith: firstChar },
        ...categoryFilter,
      },
      take: 500,
    });
    for (const t of candidates) {
      if (results.has(t.id)) continue;
      const d = levenshtein(q, t.term, FUZZY_CAP);
      if (d <= FUZZY_CAP) results.set(t.id, toResult(t));
    }
  }

  // ---- Layer 3: phonetic bucket ----
  if (results.size < SUGGEST_LIMIT) {
    const code = doubleMetaphone(q.replace(/\s+/g, ""));
    if (code.length >= 2) {
      const phonetic = await prisma.searchTerm.findMany({
        where: {
          metaphone: { startsWith: code.slice(0, 3) },
          ...categoryFilter,
        },
        take: 200,
      });
      for (const t of phonetic) {
        if (results.has(t.id)) continue;
        results.set(t.id, toResult(t));
      }
    }
  }

  return Array.from(results.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, SUGGEST_LIMIT);
}

// ---------------------------------------------------------------------------
// resolveQuery(q, categoryId?) — picks the single best canonical term for a
// search query. Used by the search page to (a) optionally redirect straight
// to a product/category page, (b) spell-correct the query before we hit the
// listings table.
// ---------------------------------------------------------------------------
export async function resolveQuery(rawQ: string, categoryId?: string | null): Promise<SearchResolution> {
  const q = normalize(rawQ);
  if (!q) return { original: rawQ, corrected: null, redirectPath: null, matchedTermId: null };

  // Exact match first
  const exact = await prisma.searchTerm.findFirst({
    where: {
      term: q,
      ...(categoryId ? { OR: [{ categoryId }, { categoryId: null }] } : {}),
    },
    orderBy: [{ searchFrequency: "desc" }],
  });

  if (exact) {
    return {
      original: rawQ,
      corrected: exact.term === q ? null : exact.term,
      redirectPath: exact.redirectPath,
      matchedTermId: exact.id,
    };
  }

  // Fuzzy fallback via suggest()
  const [top] = await suggest(rawQ, categoryId);
  if (!top) return { original: rawQ, corrected: null, redirectPath: null, matchedTermId: null };

  return {
    original: rawQ,
    corrected: top.term === q ? null : top.term,
    redirectPath: top.redirectPath,
    matchedTermId: top.id,
  };
}

// ---------------------------------------------------------------------------
// logQuery — fire-and-forget. Feeds the vocabulary builder on each rebuild.
// ---------------------------------------------------------------------------
export async function logQuery(args: {
  query: string;
  userId?: string | null;
  categoryId?: string | null;
  resultCount: number;
}): Promise<void> {
  try {
    await prisma.searchQueryLog.create({
      data: {
        query: args.query,
        normalized: normalize(args.query),
        userId: args.userId ?? null,
        categoryId: args.categoryId ?? null,
        resultCount: args.resultCount,
      },
    });
  } catch {
    // swallow — search must never fail because logging failed
  }
}

// ---------------------------------------------------------------------------
// recordHit — called when a user actually clicks a suggestion. Bumps the
// term's search frequency + last-searched timestamp so it climbs the ranking.
// ---------------------------------------------------------------------------
export async function recordHit(termId: string): Promise<void> {
  try {
    await prisma.searchTerm.update({
      where: { id: termId },
      data: {
        searchFrequency: { increment: 1 },
        lastSearchedAt: new Date(),
      },
    });
  } catch {
    /* swallow */
  }
}

// ---------------------------------------------------------------------------
// recordClick — called when a user clicks a *listing* from a search/suggest.
// Bumps the term's viewCount (stronger signal than a typed query).
// ---------------------------------------------------------------------------
export async function recordClick(args: { termId?: string | null; listingId: string; queryLogId?: string | null }): Promise<void> {
  try {
    if (args.termId) {
      await prisma.searchTerm.update({
        where: { id: args.termId },
        data: { viewCount: { increment: 1 } },
      });
    }
    if (args.queryLogId) {
      await prisma.searchQueryLog.update({
        where: { id: args.queryLogId },
        data: { clickedListingId: args.listingId, clickedTermId: args.termId ?? null },
      });
    }
  } catch {
    /* swallow */
  }
}

// ---------------------------------------------------------------------------
function toResult(t: {
  id: string;
  term: string;
  displayTerm: string;
  termType: string;
  categoryId: string | null;
  redirectPath: string | null;
  searchFrequency: number;
  viewCount: number;
  lastSearchedAt: Date | null;
}): SuggestionResult {
  return {
    id: t.id,
    term: t.term,
    displayTerm: t.displayTerm,
    termType: t.termType,
    categoryId: t.categoryId,
    redirectPath: t.redirectPath,
    score: scoreTerm({
      searchFrequency: t.searchFrequency,
      viewCount: t.viewCount,
      lastSearchedAt: t.lastSearchedAt,
    }),
  };
}

// Re-export algorithms for downstream (vocab builder etc).
export * from "./algorithms";
// Keep SearchQueryLog reference for future usage.
export const _tokenize = tokenize;
