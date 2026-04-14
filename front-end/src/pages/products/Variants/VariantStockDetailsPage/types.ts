import { CompanyProductVariant } from "@/services/companyProductVariants";
import { CompanyProductStock } from "@/services/companyProductStock";
import { Currency } from "@/services/currencies";

export interface VariantStockDetailsPageProps {
  productId: string;
  variantId: string;
  onBack: () => void;
}

export interface StockOverviewProps {
  totalStock: number;
  activeStockQuantity: number;
  stockEntriesCount: number;
  totalCostValue: number;
  totalSellValue: number;
  formatPrice: (price: number | undefined | null) => string;
  isOutOfStock: boolean;
}

export interface StockEntryCardProps {
  entry: CompanyProductStock;
  variant: CompanyProductVariant;
  formatPrice: (price: number | undefined | null) => string;
  onEdit: (entry: CompanyProductStock) => void;
  onDelete: (entryId: string) => void;
  onSetAsActive: (entryId: string) => void;
}

export interface StockEntriesListProps {
  entries: CompanyProductStock[];
  variant: CompanyProductVariant;
  formatPrice: (price: number | undefined | null) => string;
  onAddStock: () => void;
  onEdit: (entry: CompanyProductStock) => void;
  onDelete: (entryId: string) => void;
  onSetAsActive: (entryId: string) => void;
}

export interface VariantInfoSidebarProps {
  variant: CompanyProductVariant;
  productName?: string;
  productImageUrl?: string;
}

export interface StockAlertProps {
  isOutOfStock: boolean;
}
