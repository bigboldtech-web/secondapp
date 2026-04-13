import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const THRESHOLD = 0.7;
const MIN_CLICKS = 5;

async function main() {
  console.log("🏷️  Promoting dominant categories...");

  const stats = await prisma.termCategoryClick.findMany({
    orderBy: { count: "desc" },
    take: 2000,
  });

  const byTerm = new Map<string, { total: number; buckets: Map<string, number> }>();
  for (const r of stats) {
    const entry = byTerm.get(r.termId) ?? { total: 0, buckets: new Map() };
    entry.total += r.count;
    entry.buckets.set(r.categoryId, (entry.buckets.get(r.categoryId) ?? 0) + r.count);
    byTerm.set(r.termId, entry);
  }

  let promoted = 0;

  for (const [termId, entry] of byTerm.entries()) {
    if (entry.total < MIN_CLICKS) continue;

    const sorted = [...entry.buckets.entries()].sort((a, b) => b[1] - a[1]);
    const [winnerId, winnerCount] = sorted[0];
    const share = winnerCount / entry.total;

    if (share < THRESHOLD) continue;

    const term = await prisma.searchTerm.findUnique({
      where: { id: termId },
      select: { id: true, categoryId: true },
    });

    if (!term) continue;
    if (term.categoryId === winnerId) continue;

    await prisma.searchTerm.update({
      where: { id: termId },
      data: { categoryId: winnerId },
    });

    promoted++;
  }

  console.log(`✅ ${promoted} term(s) reassigned to dominant category`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
