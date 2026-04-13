import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import { prisma } from "@second-app/database";

type UploadKind = "listing-photo" | "listing-video" | "store-logo" | "store-banner";

interface KindSpec {
  folder: string;
  allow: Set<string>;
  maxBytes: number;
}

const KIND_SPECS: Record<UploadKind, KindSpec> = {
  "listing-photo": {
    folder: "listings/photos",
    allow: new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]),
    maxBytes: 10 * 1024 * 1024,
  },
  "listing-video": {
    folder: "listings/video",
    allow: new Set(["video/mp4", "video/quicktime"]),
    maxBytes: 30 * 1024 * 1024,
  },
  "store-logo": {
    folder: "store/logo",
    allow: new Set(["image/jpeg", "image/png", "image/webp"]),
    maxBytes: 2 * 1024 * 1024,
  },
  "store-banner": {
    folder: "store/banner",
    allow: new Set(["image/jpeg", "image/png", "image/webp"]),
    maxBytes: 5 * 1024 * 1024,
  },
};

function resolveKind(raw: FormDataEntryValue | null, contentType: string): UploadKind {
  if (typeof raw === "string" && raw in KIND_SPECS) return raw as UploadKind;
  // Back-compat: older clients don't send `kind`. Infer from content type.
  return contentType.startsWith("video/") ? "listing-video" : "listing-photo";
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return NextResponse.json({ error: "Vendor account required" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });

  const kind = resolveKind(form.get("kind"), file.type);
  const spec = KIND_SPECS[kind];

  if (file.size > spec.maxBytes) {
    return NextResponse.json(
      { error: `File too large (max ${Math.round(spec.maxBytes / 1024 / 1024)}MB for ${kind})` },
      { status: 413 }
    );
  }
  if (!spec.allow.has(file.type)) {
    return NextResponse.json({ error: `Unsupported file type for ${kind}` }, { status: 415 });
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer());

  // Optimize images (resize to 1200px max width + convert to WebP) when
  // sharp is available. Falls through to the original buffer otherwise.
  const { optimizeImage } = await import("@/lib/image-optimize");
  const { buffer, contentType, optimized } = await optimizeImage(rawBuffer, file.type);

  const filename = optimized ? file.name.replace(/\.[^.]+$/, ".webp") : file.name;
  const result = await uploadFile({
    buffer,
    filename,
    contentType,
    folder: spec.folder,
  });

  return NextResponse.json({ url: result.url, provider: result.provider, kind });
}
