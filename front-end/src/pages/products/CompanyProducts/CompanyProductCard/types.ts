import { CompanyProduct } from "@/services/companyProducts";
import { CompanyProductVariant } from "@/services/companyProductVariants";
import { Currency } from "@/services/currencies";

export interface CompanyProductCardProps {
  product: CompanyProduct;
  viewMode: "grid" | "list";
  onDelete?: (product: CompanyProduct) => void;
  onView?: (product: CompanyProduct) => void;
  onViewVariant?: (variant: CompanyProductVariant) => void;
  onEditVariant?: (variant: CompanyProductVariant) => void;
  onDeleteVariant?: (variant: CompanyProductVariant) => void;
}

export interface ProductViewProps {
  product: CompanyProduct;
  variants: CompanyProductVariant[];
  selectedVariantId: string | null;
  selectedVariant: CompanyProductVariant | null;
  companyCurrency: Currency | null;
  imageUrl: string | null;
  imageLoading: boolean;
  imageError: boolean;
  displayCurrentStock: number;
  displayCostPrice: number;
  displaySellPrice: number;
  displayMargin: string | null;
  displayMinStock: number;
  displayMaxStock: number;
  displayStockUnit: string;
  stockStatus: { status: string; color: string };
  availabilityStatus: {
    isAvailable: boolean;
    type: 'sell' | 'service' | 'both';
    text: string;
  };
  onView?: (product: CompanyProduct) => void;
  onDelete?: (product: CompanyProduct) => void;
  onVariantChange: (variantId: string) => void;
  onImageLoad: () => void;
  onImageError: () => void;
}
