import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "in.gosecond.app",
        sha256_cert_fingerprints: [
          process.env.ANDROID_SHA256_FINGERPRINT || "00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00",
        ],
      },
    },
  ]);
}
