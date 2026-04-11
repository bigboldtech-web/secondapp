import Link from "next/link";
import { prisma } from "@second-app/database";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SearchInsightsPage() {
  await requireAdmin();

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  // Top zero-result queries — the catalog gaps we should stock next.
  const zeroRows = await prisma.searchQueryLog.groupBy({
    by: ["normalized"],
    where: { resultCount: 0, createdAt: { gte: since } },
    _count: { normalized: true },
    _max: { createdAt: true },
    orderBy: { _count: { normalized: "desc" } },
    take: 50,
  });

  // Top searches that DID return results — what buyers actually want.
  const hotRows = await prisma.searchQueryLog.groupBy({
    by: ["normalized"],
    where: { resultCount: { gt: 0 }, createdAt: { gte: since } },
    _count: { normalized: true },
    orderBy: { _count: { normalized: "desc" } },
    take: 30,
  });

  // Category learner: hand-hydrated because TermCategoryClick has no explicit
  // Prisma relations (kept deliberately thin for fast writes on click).
  const clickRows = await prisma.termCategoryClick.findMany({ orderBy: { count: "desc" }, take: 500 });
  const termIds = Array.from(new Set(clickRows.map((r) => r.termId)));
  const categoryIds = Array.from(new Set(clickRows.map((r) => r.categoryId)));
  const [terms, categories] = await Promise.all([
    prisma.searchTerm.findMany({ where: { id: { in: termIds } }, select: { id: true, displayTerm: true, termType: true, categoryId: true } }),
    prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true, slug: true } }),
  ]);
  const termMap = new Map(terms.map((t) => [t.id, t]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Group by term, compute dominance.
  interface Dominance {
    termId: string;
    displayTerm: string;
    termType: string;
    currentCategory: string | null;
    dominantCategory: string;
    dominantCategoryId: string;
    share: number;
    totalClicks: number;
  }
  const byTerm = new Map<string, { total: number; buckets: Map<string, number> }>();
  for (const r of clickRows) {
    const entry = byTerm.get(r.termId) ?? { total: 0, buckets: new Map<string, number>() };
    entry.total += r.count;
    entry.buckets.set(r.categoryId, (entry.buckets.get(r.categoryId) ?? 0) + r.count);
    byTerm.set(r.termId, entry);
  }

  const dominance: Dominance[] = [];
  for (const [termId, entry] of byTerm.entries()) {
    if (entry.total < 5) continue;
    const sorted = [...entry.buckets.entries()].sort((a, b) => b[1] - a[1]);
    const [winnerId, winnerCount] = sorted[0];
    const share = winnerCount / entry.total;
    if (share < 0.7) continue;
    const term = termMap.get(termId);
    const cat = categoryMap.get(winnerId);
    if (!term || !cat) continue;
    dominance.push({
      termId,
      displayTerm: term.displayTerm,
      termType: term.termType,
      currentCategory: term.categoryId ? categoryMap.get(term.categoryId)?.name ?? null : null,
      dominantCategory: cat.name,
      dominantCategoryId: winnerId,
      share,
      totalClicks: entry.total,
    });
  }
  dominance.sort((a, b) => b.totalClicks - a.totalClicks);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-neutral-900">Search insights</h1>
            <p className="text-[13px] text-neutral-500 mt-0.5">What buyers are typing, and where the catalog is coming up short.</p>
          </div>
          <Link href="/" className="text-[12px] text-neutral-500 no-underline hover:text-neutral-900">← Dashboard</Link>
        </header>

        <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 flex items-baseline justify-between">
            <h2 className="text-sm font-bold text-neutral-900">Zero-result queries · last 14 days</h2>
            <span className="text-[11px] text-neutral-500">catalog gaps to stock</span>
          </div>
          {zeroRows.length === 0 ? (
            <p className="px-4 py-6 text-[12px] text-neutral-500">No zero-result queries in the last 14 days 🎉</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="text-[11px] uppercase tracking-wide text-neutral-500 bg-neutral-50">
                <tr>
                  <th className="text-left font-medium px-4 py-2">Query</th>
                  <th className="text-right font-medium px-4 py-2">Times asked</th>
                  <th className="text-right font-medium px-4 py-2">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {zeroRows.map((r) => (
                  <tr key={r.normalized} className="border-t border-neutral-100">
                    <td className="px-4 py-2 font-medium text-neutral-900">{r.normalized || "(empty)"}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{r._count.normalized}</td>
                    <td className="px-4 py-2 text-right text-neutral-500 text-[12px]">
                      {r._max.createdAt ? new Date(r._max.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 flex items-baseline justify-between">
            <h2 className="text-sm font-bold text-neutral-900">Top converting searches · last 14 days</h2>
            <span className="text-[11px] text-neutral-500">what's working</span>
          </div>
          {hotRows.length === 0 ? (
            <p className="px-4 py-6 text-[12px] text-neutral-500">No results yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-neutral-100">
              {hotRows.map((r) => (
                <div key={r.normalized} className="bg-white px-4 py-2 flex items-baseline justify-between">
                  <span className="text-[13px] text-neutral-900 font-medium truncate">{r.normalized}</span>
                  <span className="text-[11px] text-neutral-500 tabular-nums">{r._count.normalized}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 flex items-baseline justify-between">
            <h2 className="text-sm font-bold text-neutral-900">Dominant categories · ≥70% click share</h2>
            <span className="text-[11px] text-neutral-500">{dominance.length} terms ready to reassign</span>
          </div>
          {dominance.length === 0 ? (
            <p className="px-4 py-6 text-[12px] text-neutral-500">
              Not enough click data yet. Each term needs at least 5 clicks before it'll show up here.
            </p>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="text-[11px] uppercase tracking-wide text-neutral-500 bg-neutral-50">
                <tr>
                  <th className="text-left font-medium px-4 py-2">Term</th>
                  <th className="text-left font-medium px-4 py-2">Type</th>
                  <th className="text-left font-medium px-4 py-2">Clicks cluster in</th>
                  <th className="text-right font-medium px-4 py-2">Share</th>
                  <th className="text-right font-medium px-4 py-2">Total clicks</th>
                </tr>
              </thead>
              <tbody>
                {dominance.slice(0, 50).map((d) => (
                  <tr key={d.termId} className="border-t border-neutral-100">
                    <td className="px-4 py-2 font-medium text-neutral-900">{d.displayTerm}</td>
                    <td className="px-4 py-2 text-neutral-500 text-[11px] uppercase tracking-wide">{d.termType}</td>
                    <td className="px-4 py-2 text-neutral-900">
                      {d.dominantCategory}
                      {d.currentCategory && d.currentCategory !== d.dominantCategory && (
                        <span className="text-[11px] text-neutral-500 ml-1">(currently {d.currentCategory})</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{Math.round(d.share * 100)}%</td>
                    <td className="px-4 py-2 text-right tabular-nums">{d.totalClicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
