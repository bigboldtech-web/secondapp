import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import { prisma } from "@second-app/database";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/quicktime"]);

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return NextResponse.json({ error: "Vendor account required" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const folder = file.type.startsWith("video/") ? "listings/video" : "listings/photos";

  const result = await uploadFile({
    buffer,
    filename: file.name,
    contentType: file.type,
    folder,
  });

  return NextResponse.json({ url: result.url, provider: result.provider });
}
