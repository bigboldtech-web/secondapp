import { NextResponse } from "next/server";
import { getCategoriesWithCounts } from "@/lib/db";
import { cached } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await cached("api:categories", 300_000, () => getCategoriesWithCounts());
  return NextResponse.json(
    { categories },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=600",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
