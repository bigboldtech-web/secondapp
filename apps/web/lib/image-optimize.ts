// Image optimization pipeline. Tries to use `sharp` for resize + WebP
// conversion; falls through to a no-op if sharp isn't installed (dev mode
// or deployments that don't need it). This keeps sharp as an optional dep
// rather than a hard build requirement.

const MAX_WIDTH = 1200;
const QUALITY = 80;

interface OptimizeResult {
  buffer: Buffer;
  contentType: string;
  optimized: boolean;
}

export async function optimizeImage(
  buffer: Buffer,
  contentType: string
): Promise<OptimizeResult> {
  // Only process images (skip videos, etc.)
  if (!contentType.startsWith("image/")) {
    return { buffer, contentType, optimized: false };
  }

  try {
    // Dynamic import so builds don't fail when sharp isn't installed.
    const sharp = (await import("sharp")).default;

    const processed = await sharp(buffer)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();

    return {
      buffer: processed,
      contentType: "image/webp",
      optimized: true,
    };
  } catch {
    // sharp not installed or processing failed — return original.
    return { buffer, contentType, optimized: false };
  }
}
