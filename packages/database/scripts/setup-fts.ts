import { readFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let buffer = "";
  let inDollar = false;
  let inLineComment = false;

  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    const next = sql[i + 1];

    if (!inDollar && !inLineComment && c === "-" && next === "-") {
      inLineComment = true;
      buffer += c;
      continue;
    }
    if (inLineComment) {
      buffer += c;
      if (c === "\n") inLineComment = false;
      continue;
    }

    if (c === "$" && next === "$") {
      inDollar = !inDollar;
      buffer += "$$";
      i += 1;
      continue;
    }

    if (c === ";" && !inDollar) {
      const trimmed = buffer.trim();
      if (trimmed.length > 0) statements.push(trimmed);
      buffer = "";
      continue;
    }

    buffer += c;
  }

  const tail = buffer.trim();
  if (tail.length > 0) statements.push(tail);

  return statements;
}

async function main() {
  const sqlPath = path.join(__dirname, "setup-fts.sql");
  const sql = readFileSync(sqlPath, "utf8");
  const statements = splitSqlStatements(sql);

  console.log(`🔎 Installing full-text search — ${statements.length} statements`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await prisma.$executeRawUnsafe(stmt);
    } catch (err) {
      console.error(`\n❌ failed on statement ${i + 1}:\n${stmt.slice(0, 200)}…\n`);
      throw err;
    }
  }

  const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT count(*)::bigint AS count FROM "Listing" WHERE "searchVector" IS NOT NULL`
  );
  const count = rows[0]?.count ?? 0n;

  console.log(`✅ full-text index ready — ${count} listings indexed`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
