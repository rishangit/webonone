import { Card } from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { DateTime } from "../../../../components/common/DateTime";
import { ProductVariant as SystemProductVariant } from "../../../../services/productVariants";

interface SystemProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  usageCount: number;
  createdDate: string;
  lastModified: string;
  tags: string[];
}

interface CompanyProduct {
  id: string;
  name: string;
  description: string;
  stock?: {
    current: number;
    unit: string;
  };
  [key: string]: any;
}

interface ProductDetailInfoProps {
  product: SystemProduct | CompanyProduct;
  variants?: SystemProductVariant[];
  variantsLoading?: boolean;
  selectedVariantId?: string | null;
  selectedVariant?: SystemProductVariant | null;
  onVariantSelect?: (variant: SystemProductVariant | null) => void;
}

export const ProductDetailInfo = ({ 
  product, 
  variants = [],
  variantsLoading = false,
  selectedVariantId = null,
  selectedVariant = null,
  onVariantSelect
}: ProductDetailInfoProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <h3 className="font-semibold text-foreground mb-4">Product Information</h3>
      <div className="space-y-4">
        <div>
          <Label className="text-muted-foreground">Description</Label>
          <p className="text-foreground mt-1">{product.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(product as any).usageCount !== undefined && (
            <div>
              <Label className="text-muted-foreground">Used by</Label>
              <p className="text-foreground">{(product as any).usageCount} companies</p>
            </div>
          )}
          {(product as any).stock && (
            <div>
              <Label className="text-muted-foreground">Stock</Label>
              <p className="text-foreground">{(product as any).stock.current} {(product as any).stock.unit}</p>
            </div>
          )}
          {(product as any).createdDate && (
            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p className="text-foreground">
                <DateTime date={(product as any).createdDate} />
              </p>
            </div>
          )}
          {(product as any).lastModified && (
            <div>
              <Label className="text-muted-foreground">Last Modified</Label>
              <p className="text-foreground">
                <DateTime date={(product as any).lastModified} />
              </p>
            </div>
          )}
        </div>

        {/* Variant Selector - Only show if there are multiple variants */}
        {variants && variants.length > 1 && onVariantSelect && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Select Variant</Label>
            <Select 
              value={selectedVariantId || ''} 
              onValueChange={(value) => {
                const variant = variants.find(v => v.id === value);
                onVariantSelect(variant || null);
              }}
              disabled={variantsLoading}
            >
              <SelectTrigger className="w-full bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
                <SelectValue placeholder={variantsLoading ? "Loading variants..." : "Select variant"} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {variants.map((variant) => (
                  <SelectItem 
                    key={variant.id} 
                    value={variant.id}
                  >
                    {variant.name}
                    {variant.isDefault && ' (Default)'}
                    {variant.isVerified && ' ✓'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedVariant && (
              <div className="mt-2 pt-2 border-t border-border space-y-1 text-xs">
                {selectedVariant.sku && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SKU:</span>
                    <span className="text-foreground font-medium">{selectedVariant.sku}</span>
                  </div>
                )}
                {selectedVariant.isDefault && (
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <span className="text-xs">⭐ Default Variant</span>
                  </div>
                )}
                {selectedVariant.isVerified && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <span className="text-xs">✓ Verified</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
