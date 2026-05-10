import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductRelatedAttribute } from "@/features/products/services/productRelatedAttributes";
import { unitsOfMeasureService, UnitsOfMeasure } from "@/features/products/services/unitsOfMeasure";
import { VariantDefiningAttributeValueField } from "./VariantDefiningAttributeValueField";

interface VariantAttributeSelectorProps {
  productId: string;
  selectedAttributes: Record<string, string>; // attributeId -> value
  variantDefiningAttributes: string[]; // attributeIds that define the variant
  onAttributeSelect: (attributeId: string, isSelected: boolean) => void;
  onValueChange: (attributeId: string, value: string) => void;
  readOnly?: boolean;
}

export const VariantAttributeSelector = ({
  productId,
  selectedAttributes,
  variantDefiningAttributes,
  onAttributeSelect,
  onValueChange,
  readOnly = false,
}: VariantAttributeSelectorProps) => {
  const [productAttributes, setProductAttributes] = useState<ProductRelatedAttribute[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitsOfMeasure[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) return;
      
      setLoading(true);
      try {
        const [attributes, units] = await Promise.all([
            import("@/features/products/services/productRelatedAttributes").then(m => 
            m.productRelatedAttributesService.getAttributesByProductId(productId)
          ),
          unitsOfMeasureService.getActiveUnits(),
        ]);
        setProductAttributes(attributes);
        setUnitsOfMeasure(units);
      } catch (error) {
        console.error("Error fetching product attributes or units:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">Loading attributes...</div>
    );
  }

  if (productAttributes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No attributes assigned to this product. Add attributes in the Product Attributes tab.
      </div>
    );
  }

  // Only attributes with 2+ predefined option values can drive a variant choice.
  // Single-option (or none) leaves nothing to pick, so exclude from the picker.
  const selectableAttributes = productAttributes.filter(
    (attr) => Array.isArray(attr.variantOptionValues) && attr.variantOptionValues.length > 1,
  );

  if (selectableAttributes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No attributes with multiple values. Open the Product Attributes tab and use the
        kebab menu &rarr; <span className="font-medium">Set values</span> to define two or
        more options before adding a variant.
      </div>
    );
  }

  const handleCheckboxChange = (attributeId: string, checked: boolean) => {
    onAttributeSelect(attributeId, checked);
    // Note: We keep the value even when unchecking - value input is always visible
    // User can still see and edit the value even if checkbox is unchecked
  };

  return (
    <div className="space-y-3">
      <div className="max-h-96 overflow-y-auto custom-scrollbar pr-2">
        <div className="space-y-2">
          {selectableAttributes.map((attr) => {
            // variantDefiningAttributes contains attributeIds, not productRelatedAttributeIds
            const isSelected = variantDefiningAttributes.includes(attr.attributeId);
            // Check if this attribute is marked as variant-defining in the database
            const isVariantDefining = attr.isVariantDefining || false;
            // selectedAttributes uses productRelatedAttributeId as key
            const currentValue = selectedAttributes[attr.id] || "";
            
            return (
              <Card 
                key={attr.id} 
                className={`p-3 backdrop-blur-xl border-[var(--glass-border)] ${
                  isSelected || isVariantDefining
                    ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/50" 
                    : "bg-[var(--glass-bg)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`attr-${attr.id}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleCheckboxChange(attr.attributeId, checked as boolean)}
                    disabled={readOnly}
                    className={`flex-shrink-0 ${isVariantDefining ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                  />
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Label 
                          htmlFor={`attr-${attr.id}`}
                          className="text-foreground font-medium cursor-pointer text-sm whitespace-nowrap"
                        >
                          {attr.attributeName}
                        </Label>
                        {attr.unitOfMeasure && (() => {
                          const unit = unitsOfMeasure.find(u => u.id === attr.unitOfMeasure);
                          return (
                            <span className="text-muted-foreground font-normal text-xs">
                              ({unit ? unit.symbol : attr.unitOfMeasure})
                            </span>
                          );
                        })()}
                        {isVariantDefining && (
                          <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs flex-shrink-0">
                            Variant-Defining
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs flex-shrink-0">{attr.valueDataType}</Badge>
                      </div>
                      {attr.attributeDescription && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{attr.attributeDescription}</p>
                      )}
                    </div>
                    
                    {/* Value input in same row */}
                    <div className="flex-shrink-0 w-48 min-w-[10rem]">
                      <VariantDefiningAttributeValueField
                        valueDataType={attr.valueDataType ?? "text"}
                        value={currentValue}
                        onChange={(v) => onValueChange(attr.id, v)}
                        variantOptionValues={attr.variantOptionValues}
                        readOnly={readOnly}
                        compact
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
