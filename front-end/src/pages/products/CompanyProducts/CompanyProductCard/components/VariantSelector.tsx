import { Label } from "../../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";
import { CompanyProductVariant } from "../../../../../services/companyProductVariants";

interface VariantSelectorProps {
  variants: CompanyProductVariant[];
  selectedVariantId: string | null;
  onVariantChange: (variantId: string) => void;
}

export const VariantSelector = ({
  variants,
  selectedVariantId,
  onVariantChange
}: VariantSelectorProps) => {
  if (variants.length <= 1) return null;

  return (
    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
      <Label className="text-xs text-muted-foreground mb-1 block">Variant</Label>
      <Select 
        value={selectedVariantId || ''} 
        onValueChange={onVariantChange}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Select variant" />
        </SelectTrigger>
        <SelectContent>
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
    </div>
  );
};
