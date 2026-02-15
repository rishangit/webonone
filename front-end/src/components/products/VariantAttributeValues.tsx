import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { ProductRelatedAttribute } from "../../services/productRelatedAttributes";
import { ProductRelatedAttributeValue } from "../../services/productRelatedAttributeValues";

interface VariantAttributeValuesProps {
  productId: string;
  variantId?: string | null;
  attributeValues: Record<string, string>;
  onChange: (productRelatedAttributeId: string, value: string) => void;
  excludeAttributeIds?: string[]; // Attributes to exclude from this list
  readOnly?: boolean;
}

export const VariantAttributeValues = ({
  productId,
  variantId,
  attributeValues,
  onChange,
  excludeAttributeIds = [],
  readOnly = false,
}: VariantAttributeValuesProps) => {
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

  const handleValueChange = (productRelatedAttributeId: string, value: string) => {
    onChange(productRelatedAttributeId, value);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-foreground mb-3 block">Product Attribute Values</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Set values for the product attributes assigned to this product.
        </p>
      </div>
      
      <div className="space-y-3">
        {productAttributes
          .filter((attr) => !excludeAttributeIds.includes(attr.id))
          .map((attr) => {
            const currentValue = attributeValues[attr.id] || "";
            
            return (
            <Card key={attr.id} className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Label className="text-foreground font-medium">
                      {attr.attributeName}
                      {attr.unitOfMeasure && (
                        <span className="text-muted-foreground font-normal ml-1">
                          ({attr.unitOfMeasure})
                        </span>
                      )}
                    </Label>
                    {attr.attributeDescription && (
                      <p className="text-sm text-muted-foreground mt-1">{attr.attributeDescription}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{attr.valueDataType}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  {attr.valueDataType === "text" && (
                    <Input
                      type="text"
                      value={currentValue}
                      onChange={(e) => handleValueChange(attr.id, e.target.value)}
                      placeholder="Enter value..."
                      disabled={readOnly}
                      className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                    />
                  )}
                  {attr.valueDataType === "number" && (
                    <Input
                      type="number"
                      value={currentValue}
                      onChange={(e) => handleValueChange(attr.id, e.target.value)}
                      placeholder="Enter number..."
                      disabled={readOnly}
                      className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                    />
                  )}
                  {attr.valueDataType === "boolean" && (
                    <select
                      value={currentValue}
                      onChange={(e) => handleValueChange(attr.id, e.target.value)}
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
                      onChange={(e) => handleValueChange(attr.id, e.target.value)}
                      disabled={readOnly}
                      className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                    />
                  )}
                  {attr.valueDataType === "json" && (
                    <textarea
                      value={currentValue}
                      onChange={(e) => handleValueChange(attr.id, e.target.value)}
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
