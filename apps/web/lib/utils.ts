export function formatPrice(paise: number): string {
  const rupees = Math.round(paise / 100);
  return "₹" + rupees.toLocaleString("en-IN");
}

export function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  return `${Math.floor(days / 30)}mo`;
}

export function parseSpecs(specsJson: string | null): Record<string, string> {
  if (!specsJson) return {};
  try {
    return JSON.parse(specsJson);
  } catch {
    return {};
  }
}

export function parsePhotos(photosJson: string | null): string[] {
  if (!photosJson) return [];
  try {
    const parsed = JSON.parse(photosJson);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function calcDiscount(price: number, originalPrice: number | null): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
