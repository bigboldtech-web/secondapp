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
const FUZZY_CAP = 2;

export async function suggest(rawQ: string, categoryId?: string | null): Promise<SuggestionResult[]> {
  const q = normalize(rawQ);
  if (q.length < 2) return [];

  const categoryFilter = categoryId ? { OR: [{ categoryId }, { categoryId: null }] } : {};

  const exact = await prisma.searchTerm.findMany({
    where: {
      term: { startsWith: q },
      ...categoryFilter,
    },
    take: SUGGEST_LIMIT * 3,
  });

  const results = new Map<string, SuggestionResult>();
  for (const t of exact) results.set(t.id, toResult(t));

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

export async function resolveQuery(rawQ: string, categoryId?: string | null): Promise<SearchResolution> {
  const q = normalize(rawQ);
  if (!q) return { original: rawQ, corrected: null, redirectPath: null, matchedTermId: null };

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

  const [top] = await suggest(rawQ, categoryId);
  if (!top) return { original: rawQ, corrected: null, redirectPath: null, matchedTermId: null };

  return {
    original: rawQ,
    corrected: top.term === q ? null : top.term,
    redirectPath: top.redirectPath,
    matchedTermId: top.id,
  };
}

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
  }
}

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
  }
}

export async function recordClick(args: { termId?: string | null; listingId: string; queryLogId?: string | null }): Promise<void> {
  try {
    if (args.termId) {
      await prisma.searchTerm.update({
        where: { id: args.termId },
        data: { viewCount: { increment: 1 } },
      });

      const listing = await prisma.listing.findUnique({
        where: { id: args.listingId },
        select: { product: { select: { categoryId: true } } },
      });
      const categoryId = listing?.product.categoryId;
      if (categoryId) {
        await prisma.termCategoryClick.upsert({
          where: { termId_categoryId: { termId: args.termId, categoryId } },
          create: { termId: args.termId, categoryId, count: 1 },
          update: { count: { increment: 1 } },
        });
      }
    }
    if (args.queryLogId) {
      await prisma.searchQueryLog.update({
        where: { id: args.queryLogId },
        data: { clickedListingId: args.listingId, clickedTermId: args.termId ?? null },
      });
    }
  } catch {
  }
}

const DOMINANT_THRESHOLD = 0.7;
const MIN_SAMPLES = 5;

export async function getDominantCategory(termId: string): Promise<string | null> {
  const rows = await prisma.termCategoryClick.findMany({
    where: { termId },
    select: { categoryId: true, count: true },
  });
  if (rows.length === 0) return null;

  const total = rows.reduce((sum, r) => sum + r.count, 0);
  if (total < MIN_SAMPLES) return null;

  const winner = rows.reduce((best, r) => (r.count > best.count ? r : best), rows[0]);
  return winner.count / total >= DOMINANT_THRESHOLD ? winner.categoryId : null;
}

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

export * from "./algorithms";
export const _tokenize = tokenize;
