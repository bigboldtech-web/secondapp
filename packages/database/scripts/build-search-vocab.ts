import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string): string[] {
  const n = normalize(s);
  return n ? n.split(" ") : [];
}

function generateNgrams(phrase: string): string[] {
  const tokens = tokenize(phrase);
  const out: string[] = [];
  for (let i = 1; i <= tokens.length; i++) {
    out.push(tokens.slice(0, i).join(" "));
  }
  return out;
}

function doubleMetaphone(word: string): string {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return "";
  let out = "";
  let i = 0;
  const n = w.length;
  const at = (pos: number, s: string) =>
    pos >= 0 && pos + s.length <= n && w.substring(pos, pos + s.length) === s;
  const vowel = (c: string) => /[aeiouy]/.test(c);

  if (at(0, "kn") || at(0, "gn") || at(0, "pn") || at(0, "wr") || at(0, "ps")) i = 1;
  if (at(0, "x")) { out += "s"; i = 1; }

  while (i < n && out.length < 8) {
    const c = w[i];
    const next = w[i + 1] || "";
    switch (c) {
      case "a": case "e": case "i": case "o": case "u":
        if (i === 0) out += "a"; i += 1; break;
      case "b":
        out += "p"; i += w[i + 1] === "b" ? 2 : 1; break;
      case "c":
        if (at(i, "cia")) { out += "x"; i += 3; break; }
        if (at(i, "ch")) { out += "x"; i += 2; break; }
        if (at(i, "ck") || at(i, "cq") || at(i, "cc")) { out += "k"; i += 2; break; }
        if (next === "e" || next === "i" || next === "y") { out += "s"; i += 1; break; }
        out += "k"; i += 1; break;
      case "d":
        if (at(i, "dg") && (w[i + 2] === "e" || w[i + 2] === "i" || w[i + 2] === "y")) {
          out += "j"; i += 3; break;
        }
        out += "t"; i += w[i + 1] === "d" || w[i + 1] === "t" ? 2 : 1; break;
      case "f":
        out += "f"; i += w[i + 1] === "f" ? 2 : 1; break;
      case "g":
        if (at(i, "gh") && (i === 0 || !vowel(w[i - 1]))) { out += "k"; i += 2; break; }
        if (at(i, "gn")) { out += "k"; i += 2; break; }
        if (next === "e" || next === "i" || next === "y") { out += "j"; i += 1; break; }
        out += "k"; i += w[i + 1] === "g" ? 2 : 1; break;
      case "h":
        if (i === 0 || vowel(w[i + 1] || "")) out += "h"; i += 1; break;
      case "j": out += "j"; i += 1; break;
      case "k": out += "k"; i += w[i + 1] === "k" ? 2 : 1; break;
      case "l": out += "l"; i += w[i + 1] === "l" ? 2 : 1; break;
      case "m": out += "m"; i += w[i + 1] === "m" ? 2 : 1; break;
      case "n": out += "n"; i += w[i + 1] === "n" ? 2 : 1; break;
      case "p":
        if (next === "h") { out += "f"; i += 2; break; }
        out += "p"; i += w[i + 1] === "p" ? 2 : 1; break;
      case "q": out += "k"; i += 1; break;
      case "r": out += "r"; i += w[i + 1] === "r" ? 2 : 1; break;
      case "s":
        if (at(i, "sh")) { out += "x"; i += 2; break; }
        if (at(i, "sch")) { out += "x"; i += 3; break; }
        out += "s"; i += w[i + 1] === "s" ? 2 : 1; break;
      case "t":
        if (at(i, "th")) { out += "0"; i += 2; break; }
        if (at(i, "tch") || at(i, "tio") || at(i, "tia")) { out += "x"; i += 3; break; }
        out += "t"; i += w[i + 1] === "t" ? 2 : 1; break;
      case "v": out += "f"; i += 1; break;
      case "w":
        if (vowel(w[i + 1] || "")) out += "w"; i += 1; break;
      case "x": out += "ks"; i += 1; break;
      case "y":
        if (vowel(w[i + 1] || "")) out += "y"; i += 1; break;
      case "z": out += "s"; i += w[i + 1] === "z" ? 2 : 1; break;
      default: i += 1;
    }
  }
  return out.slice(0, 8);
}

interface TermSeed {
  displayTerm: string;
  termType: "brand" | "model" | "product" | "category" | "ngram" | "query";
  categoryId: string | null;
  redirectPath: string | null;
  frequencyHint?: number;
}

async function upsertTerm(seed: TermSeed): Promise<void> {
  const term = normalize(seed.displayTerm);
  if (!term || term.length < 2) return;
  const metaphone = doubleMetaphone(term.replace(/\s+/g, ""));

  const existing = await prisma.searchTerm.findFirst({
    where: { term, termType: seed.termType, categoryId: seed.categoryId ?? null },
    select: { id: true },
  });

  if (existing) {
    await prisma.searchTerm.update({
      where: { id: existing.id },
      data: {
        displayTerm: seed.displayTerm,
        metaphone,
        redirectPath: seed.redirectPath,
      },
    });
  } else {
    await prisma.searchTerm.create({
      data: {
        term,
        displayTerm: seed.displayTerm,
        termType: seed.termType,
        categoryId: seed.categoryId,
        metaphone,
        redirectPath: seed.redirectPath,
        searchFrequency: seed.frequencyHint ?? 0,
      },
    });
  }
}

async function main() {
  console.log("🔎 Building search vocabulary...");

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
  });
  for (const c of categories) {
    await upsertTerm({
      displayTerm: c.name,
      termType: "category",
      categoryId: c.id,
      redirectPath: `/category/${c.slug}`,
      frequencyHint: 50,
    });
  }
  console.log(`  categories: ${categories.length}`);

  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, categoryId: true },
  });
  for (const b of brands) {
    await upsertTerm({
      displayTerm: b.name,
      termType: "brand",
      categoryId: b.categoryId,
      redirectPath: null,
      frequencyHint: 20,
    });
  }
  console.log(`  brands: ${brands.length}`);

  const models = await prisma.model.findMany({
    where: { isActive: true },
    select: { id: true, name: true, brand: { select: { name: true, categoryId: true } } },
  });
  for (const m of models) {
    const full = `${m.brand.name} ${m.name}`;
    for (const ngram of generateNgrams(full)) {
      if (ngram.length < 3) continue;
      await upsertTerm({
        displayTerm: ngram,
        termType: "ngram",
        categoryId: m.brand.categoryId,
        redirectPath: null,
        frequencyHint: 5,
      });
    }
    await upsertTerm({
      displayTerm: m.name,
      termType: "model",
      categoryId: m.brand.categoryId,
      redirectPath: null,
      frequencyHint: 10,
    });
  }
  console.log(`  models: ${models.length}`);

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, displayName: true, categoryId: true },
  });
  for (const p of products) {
    await upsertTerm({
      displayTerm: p.displayName,
      termType: "product",
      categoryId: p.categoryId,
      redirectPath: `/product/${p.slug}`,
      frequencyHint: 15,
    });
    for (const ngram of generateNgrams(p.displayName)) {
      if (ngram.length < 3 || ngram === normalize(p.displayName)) continue;
      await upsertTerm({
        displayTerm: ngram,
        termType: "ngram",
        categoryId: p.categoryId,
        redirectPath: `/product/${p.slug}`,
        frequencyHint: 3,
      });
    }
  }
  console.log(`  products: ${products.length}`);

  const recentLogs = await prisma.searchQueryLog.groupBy({
    by: ["normalized"],
    _count: { normalized: true },
    orderBy: { _count: { normalized: "desc" } },
    take: 1000,
  });
  let queryTermsAdded = 0;
  for (const row of recentLogs) {
    if (!row.normalized || row.normalized.length < 3) continue;
    if (row._count.normalized <= 2) continue;
    await upsertTerm({
      displayTerm: row.normalized,
      termType: "query",
      categoryId: null,
      redirectPath: null,
      frequencyHint: row._count.normalized,
    });
    queryTermsAdded++;
  }
  console.log(`  query-log terms: ${queryTermsAdded}`);

  const total = await prisma.searchTerm.count();
  console.log(`\n✅ vocabulary size: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
