/** Normalize first image path from API shapes (images[] + legacy image). */
export function getPrimaryImagePath(images: string[] | undefined | null, legacyImage?: string | null): string {
  const list = Array.isArray(images) ? images : [];
  return list[0] || legacyImage || "";
}
