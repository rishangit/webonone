import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { ProductRelatedAttribute } from "../../services/productRelatedAttributes";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProductAttributes = async () => {
      if (!productId) return;
      
      setLoading(true);
      try {
        const { productRelatedAttributesService } = await import("../../services/productRelatedAttributes");
        const attributes = await productRelatedAttributesService.getAttributesByProductId(productId);
        setProductAttributes(attributes);
      } catch (error) {
        console.error("Error fetching product attributes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAttributes();
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

  const handleCheckboxChange = (attributeId: string, checked: boolean) => {
    onAttributeSelect(attributeId, checked);
    // Note: We keep the value even when unchecking - value input is always visible
    // User can still see and edit the value even if checkbox is unchecked
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {productAttributes.map((attr) => {
          // variantDefiningAttributes contains attributeIds, not productRelatedAttributeIds
          const isSelected = variantDefiningAttributes.includes(attr.attributeId);
          // Check if this attribute is marked as variant-defining in the database
          const isVariantDefining = attr.isVariantDefining || false;
          // selectedAttributes uses productRelatedAttributeId as key
          const currentValue = selectedAttributes[attr.id] || "";
          
          return (
            <Card 
              key={attr.id} 
              className={`p-4 backdrop-blur-xl border-[var(--glass-border)] ${
                isSelected || isVariantDefining
                  ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/50" 
                  : "bg-[var(--glass-bg)]"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`attr-${attr.id}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleCheckboxChange(attr.attributeId, checked as boolean)}
                    disabled={readOnly}
                    className={`mt-1 ${isVariantDefining ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label 
                        htmlFor={`attr-${attr.id}`}
                        className="text-foreground font-medium cursor-pointer"
                      >
                        {attr.attributeName}
                        {attr.unitOfMeasure && (
                          <span className="text-muted-foreground font-normal ml-1">
                            ({attr.unitOfMeasure})
                          </span>
                        )}
                      </Label>
                      {isVariantDefining && (
                        <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs">
                          Variant-Defining
                        </Badge>
                      )}
                    </div>
                    {attr.attributeDescription && (
                      <p className="text-sm text-muted-foreground mt-1">{attr.attributeDescription}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{attr.valueDataType}</Badge>
                    </div>
                  </div>
                </div>
                
                {/* Always show value input, not just when selected */}
                <div className="ml-7 mt-2">
                    {attr.valueDataType === "text" && (
                      <Input
                        type="text"
                        value={currentValue}
                        onChange={(e) => onValueChange(attr.id, e.target.value)}
                        placeholder="Enter value..."
                        disabled={readOnly}
                        className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                      />
                    )}
                    {attr.valueDataType === "number" && (
                      <Input
                        type="number"
                        value={currentValue}
                        onChange={(e) => onValueChange(attr.id, e.target.value)}
                        placeholder="Enter number..."
                        disabled={readOnly}
                        className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                      />
                    )}
                    {attr.valueDataType === "boolean" && (
                      <select
                        value={currentValue}
                        onChange={(e) => onValueChange(attr.id, e.target.value)}
                        disabled={readOnly}
                        className="w-full px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground disabled:opacity-50"
                      >
                        <option value="">Select...</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    )}
                    {attr.valueDataType === "date" && (
                      <Input
                        type="date"
                        value={currentValue}
                        onChange={(e) => onValueChange(attr.id, e.target.value)}
                        disabled={readOnly}
                        className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                      />
                    )}
                    {attr.valueDataType === "json" && (
                      <textarea
                        value={currentValue}
                        onChange={(e) => onValueChange(attr.id, e.target.value)}
                        placeholder="Enter JSON..."
                        disabled={readOnly}
                        className="w-full px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground disabled:opacity-50"
                        rows={4}
                      />
                    )}
                  </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
