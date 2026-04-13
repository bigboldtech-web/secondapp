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
  if (!contentType.startsWith("image/")) {
    return { buffer, contentType, optimized: false };
  }

  try {
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
    return { buffer, contentType, optimized: false };
  }
}
