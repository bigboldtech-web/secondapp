import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appID: `${process.env.APPLE_TEAM_ID || "XXXXXXXXXX"}.in.gosecond.app`,
            paths: ["/listing/*", "/product/*", "/store/*", "/category/*"],
          },
        ],
      },
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
