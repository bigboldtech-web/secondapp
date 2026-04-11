import { NextResponse } from "next/server";
import { getCategoriesWithCounts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await getCategoriesWithCounts();
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
