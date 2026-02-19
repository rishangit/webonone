import { Card } from "../../../../../components/ui/card";
import { Label } from "../../../../../components/ui/label";
import { Textarea } from "../../../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";
import { Badge } from "../../../../../components/ui/badge";
import { CompanyProduct } from "../../../../../services/companyProducts";
import { CompanyProductVariant } from "../../../../../services/companyProductVariants";

interface CompanyProductDetailInfoProps {
  product: CompanyProduct;
  variants: CompanyProductVariant[];
  variantsLoading: boolean;
  selectedVariantId: string | null;
  selectedVariant: CompanyProductVariant | null;
  onVariantSelect: (variant: CompanyProductVariant | null) => void;
  isEditing: boolean;
  formData: {
    notes: string;
    isAvailableForPurchase: boolean;
  };
  onFormChange: (field: string, value: any) => void;
}

export const CompanyProductDetailInfo = ({
  product,
  variants,
  variantsLoading,
  selectedVariantId,
  selectedVariant,
  onVariantSelect,
  isEditing,
  formData,
  onFormChange,
}: CompanyProductDetailInfoProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <h3 className="font-semibold text-foreground mb-4">Product Information</h3>
      <div className="space-y-4">
        <div>
          <Label className="text-muted-foreground">Description</Label>
          <p className="text-foreground mt-1">{product.description || 'No description available'}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.sku && (
            <div>
              <Label className="text-muted-foreground">SKU</Label>
              <p className="text-foreground">{product.sku}</p>
            </div>
          )}
        </div>

        {/* Variant Selector - Only show if there are multiple variants */}
        {variants.length > 1 && (
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
                      {variant.color && ` - ${variant.color}`}
                      {variant.size && ` (${variant.size})`}
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stock:</span>
                    <span className="text-foreground font-medium">{selectedVariant.activeStock?.quantity || 0}</span>
                  </div>
                  {selectedVariant.isDefault && (
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <span className="text-xs">⭐ Default Variant</span>
                    </div>
                  )}
                </div>
              )}
            </div>
        )}

        {isEditing && (
          <div className="space-y-4">
              <div>
                <Label htmlFor="isAvailableForPurchase">Availability</Label>
                <Select 
                  value={formData.isAvailableForPurchase ? 'true' : 'false'} 
                  onValueChange={(value) => onFormChange('isAvailableForPurchase', value === 'true')}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Available for Purchase</SelectItem>
                    <SelectItem value="false">Not Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => onFormChange('notes', e.target.value)}
                  placeholder="Add any additional notes about this product..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
        )}
      </div>
    </Card>
  );
};
