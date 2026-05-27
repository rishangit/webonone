import type { Currency } from "@/shared/services/currencies";
import type { CompanyProductVariant } from "@/features/products/services/companyProductVariants";

/** Prefix for all showcase fixture entity IDs (no backend records). */
export const SHOWCASE_FIXTURE_ID_PREFIX = "showcase-";

/** Unsplash hero images for showcase cards (external URLs; no upload API). */
/** Same fallback as Services list cards (known to load in dev). */
export const SHOWCASE_IMAGE_SERVICE =
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop";
export const SHOWCASE_IMAGE_SYSTEM_SERVICE =
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop";
export const SHOWCASE_IMAGE_PRODUCT =
  "https://images.unsplash.com/photo-1556228578-0d44b731cfe6?w=800&h=600&fit=crop";
export const SHOWCASE_IMAGE_SYSTEM_PRODUCT =
  "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=600&fit=crop";
export const SHOWCASE_IMAGE_SPACE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop";
export const SHOWCASE_IMAGE_MEDIA =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop";

/** Demo variant for company product cards in showcase. */
export const SHOWCASE_COMPANY_PRODUCT_VARIANTS: CompanyProductVariant[] = [
  {
    id: "showcase-variant-1",
    companyProductId: "showcase-product-1",
    name: "Standard",
    sku: "SKU-001-STD",
    type: "sell",
    isDefault: true,
    isActive: true,
    minStock: 5,
    maxStock: 100,
    activeStock: { costPrice: 28, sellPrice: 49.99, quantity: 42 },
  },
];

export function isShowcaseFixtureId(id: string | null | undefined): boolean {
  return typeof id === "string" && id.startsWith(SHOWCASE_FIXTURE_ID_PREFIX);
}

/** Static currency for showcase cards — avoids company/currency API calls. */
export const SHOWCASE_FIXTURE_CURRENCY: Currency = {
  id: "showcase-currency-usd",
  name: "USD",
  symbol: "$",
  decimals: 2,
  rounding: 0.01,
  isActive: true,
};
