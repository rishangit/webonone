import type { CompanyProduct } from "@/features/products/services/productApi";

export type CompanyProductWithVariants = CompanyProduct & {
  variants?: Array<{
    isDefault?: boolean;
    isActive?: boolean;
    activeStock?: { sellPrice?: number | null };
  }>;
};

/** Unit sell price from the default (or first active) variant, or 0 if missing. */
export function getCompanyProductDefaultUnitPrice(product: CompanyProductWithVariants): number {
  const variants = (product.variants || []).filter((v) => v.isActive !== false);
  const def = variants.find((v) => v.isDefault) || variants[0];
  const raw = def?.activeStock?.sellPrice;
  if (raw == null) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}
