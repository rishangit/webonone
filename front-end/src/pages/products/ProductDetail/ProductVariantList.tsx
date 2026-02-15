import { Plus, Package } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { ProductVariantCard } from "./ProductVariantCard";
import { ProductVariant as SystemProductVariant } from "../../../services/productVariants";

interface LegacyProductVariant {
  id: string;
  name: string;
  description?: string;
  sku: string;
  isActive: boolean;
  color?: string;
  size?: string;
  weight?: string;
  dimensions?: string;
  material?: string;
  notes?: string;
}

interface ProductVariantListProps {
  productType: "system" | "company";
  systemVariants: SystemProductVariant[];
  companyVariants?: LegacyProductVariant[];
  variantsLoading: boolean;
  selectedVariantId: string | null;
  isSuperAdmin?: boolean;
  onVariantSelect: (variant: SystemProductVariant | LegacyProductVariant | null) => void;
  onAddVariant: () => void;
  onEditVariant?: (variant: SystemProductVariant | LegacyProductVariant) => void;
  onDeleteVariant?: (variantId: string) => void;
  onToggleVariantStatus?: (variant: SystemProductVariant) => void;
  onToggleVariantVerification?: (variant: SystemProductVariant) => void;
  onSetDefaultVariant?: (variant: SystemProductVariant) => void;
  onUpdateVariant?: (variantId: string, updates: Partial<LegacyProductVariant>) => void;
}

export const ProductVariantList = ({
  productType,
  systemVariants,
  companyVariants = [],
  variantsLoading,
  selectedVariantId,
  isSuperAdmin = false,
  onVariantSelect,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
  onToggleVariantStatus,
  onToggleVariantVerification,
  onSetDefaultVariant,
  onUpdateVariant,
}: ProductVariantListProps) => {
  const variants = productType === "system" ? systemVariants : (companyVariants || []);
  const variantCount = variants.length;

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Product Variants</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {variantCount} variant{variantCount !== 1 ? 's' : ''}
          </Badge>
          <Button
            size="sm"
            onClick={onAddVariant}
            className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)]"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Variant
          </Button>
        </div>
      </div>

      {variantsLoading ? (
        <div className="text-center py-8">
          <div className="animate-pulse">Loading variants...</div>
        </div>
      ) : variantCount > 0 ? (
        <div className="space-y-4">
          {variants.map((variant) => (
            <ProductVariantCard
              key={variant.id}
              variant={variant}
              isSelected={selectedVariantId === variant.id}
              productType={productType}
              isSuperAdmin={isSuperAdmin}
              onSelect={() => onVariantSelect(selectedVariantId === variant.id ? null : variant)}
              onEdit={onEditVariant}
              onDelete={onDeleteVariant}
              onToggleStatus={onToggleVariantStatus}
              onToggleVerification={onToggleVariantVerification}
              onSetDefault={onSetDefaultVariant}
              onUpdate={onUpdateVariant}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium text-foreground mb-2">No Variants Available</h4>
          <p className="text-muted-foreground text-sm">This product doesn't have any variants configured.</p>
        </div>
      )}
    </Card>
  );
};
