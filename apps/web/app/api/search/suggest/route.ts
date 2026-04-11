import { NextResponse } from "next/server";
import { suggest } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const categoryId = url.searchParams.get("categoryId");

  const results = await suggest(q, categoryId);

  return NextResponse.json(
    {
      query: q,
      results: results.map((r) => ({
        id: r.id,
        term: r.term,
        displayTerm: r.displayTerm,
        termType: r.termType,
        redirectPath: r.redirectPath,
      })),
    },
    {
      headers: {
        // short public cache — the data changes slowly and bursts are common
        "Cache-Control": "public, max-age=30, s-maxage=60",
      },
    }
  );
}
