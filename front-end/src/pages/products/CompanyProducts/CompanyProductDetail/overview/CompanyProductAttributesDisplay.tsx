import { useState, useEffect } from "react";
import { Card } from "../../../../../components/ui/card";
import { Label } from "../../../../../components/ui/label";
import { Separator } from "../../../../../components/ui/separator";
import { ProductRelatedAttribute } from "../../../../../services/productRelatedAttributes";
import { productRelatedAttributesService } from "../../../../../services/productRelatedAttributes";
import { productRelatedAttributeValuesService } from "../../../../../services/productRelatedAttributeValues";
import { unitsOfMeasureService, UnitsOfMeasure } from "../../../../../services/unitsOfMeasure";
import { CompanyProductVariant } from "../../../../../services/companyProductVariants";

interface CompanyProductAttributesDisplayProps {
  systemProductId: string | null;
  selectedVariant: CompanyProductVariant | null;
}

export const CompanyProductAttributesDisplay = ({
  systemProductId,
  selectedVariant,
}: CompanyProductAttributesDisplayProps) => {
  const [productAttributes, setProductAttributes] = useState<ProductRelatedAttribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitsOfMeasure[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch product attributes and units of measure
  useEffect(() => {
    const fetchData = async () => {
      if (!systemProductId) {
        setProductAttributes([]);
        return;
      }

      setLoading(true);
      try {
        const [attributes, units] = await Promise.all([
          productRelatedAttributesService.getAttributesByProductId(systemProductId),
          unitsOfMeasureService.getActiveUnits(),
        ]);
        setProductAttributes(attributes);
        setUnitsOfMeasure(units);
      } catch (error) {
        console.error("Error fetching product attributes:", error);
        setProductAttributes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [systemProductId]);

  // Fetch attribute values for selected variant (with fallback to system variant)
  useEffect(() => {
    const fetchAttributeValues = async () => {
      if (!selectedVariant?.id) {
        setAttributeValues({});
        return;
      }

      try {
        // First, fetch company variant attribute values
        const companyValues = await productRelatedAttributeValuesService.getValuesByVariantId(selectedVariant.id);
        const valuesMap: Record<string, string> = {};
        const hasValueMap: Record<string, boolean> = {};
        
        // Map company variant values
        companyValues.forEach((val) => {
          if (val.attributeValue && val.attributeValue.trim() !== "") {
            valuesMap[val.productRelatedAttributeId] = val.attributeValue;
            hasValueMap[val.productRelatedAttributeId] = true;
          }
        });

        // If variant has a system variant reference, fetch system variant values as fallback
        if (selectedVariant.systemProductVariantId) {
          try {
            const systemValues = await productRelatedAttributeValuesService.getValuesByVariantId(selectedVariant.systemProductVariantId);
            
            // Only use system variant values for attributes that don't have company variant values
            systemValues.forEach((val) => {
              if (!hasValueMap[val.productRelatedAttributeId] && val.attributeValue && val.attributeValue.trim() !== "") {
                valuesMap[val.productRelatedAttributeId] = val.attributeValue;
              }
            });
          } catch (systemError) {
            console.error("Error fetching system variant attribute values:", systemError);
            // Continue with company variant values only
          }
        }

        setAttributeValues(valuesMap);
      } catch (error) {
        console.error("Error fetching attribute values:", error);
        setAttributeValues({});
      }
    };

    fetchAttributeValues();
  }, [selectedVariant?.id, selectedVariant?.systemProductVariantId]);

  if (!systemProductId) {
    return null;
  }

  if (loading) {
    return (
      <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <h3 className="font-semibold text-foreground mb-4">Product Attributes</h3>
        <div className="text-sm text-muted-foreground">Loading attributes...</div>
      </Card>
    );
  }

  if (productAttributes.length === 0) {
    return (
      <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <h3 className="font-semibold text-foreground mb-4">Product Attributes</h3>
        <div className="text-sm text-muted-foreground">
          No attributes assigned to this product. Attributes are inherited from the system product.
        </div>
      </Card>
    );
  }

  // Get unit of measure for an attribute
  const getUnit = (unitOfMeasureId: string | null | undefined) => {
    if (!unitOfMeasureId) return null;
    return unitsOfMeasure.find(u => u.id === unitOfMeasureId);
  };

  // Format attribute value based on data type
  const formatValue = (value: string, dataType?: string, unitOfMeasureId?: string | null) => {
    if (!value) return "—";
    
    const unit = getUnit(unitOfMeasureId);
    const unitSymbol = unit ? unit.symbol : "";

    switch (dataType) {
      case "number":
        return `${value}${unitSymbol ? ` ${unitSymbol}` : ""}`;
      case "boolean":
        return value === "true" ? "Yes" : value === "false" ? "No" : value;
      case "date":
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return value;
        }
      default:
        return `${value}${unitSymbol ? ` ${unitSymbol}` : ""}`;
    }
  };

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <h3 className="font-semibold text-foreground mb-4">Product Attributes</h3>
      {!selectedVariant ? (
        <div className="text-sm text-muted-foreground">
          Select a variant to view attribute values.
        </div>
      ) : (
        <div className="space-y-3">
          {productAttributes.map((attr, index) => {
            const value = attributeValues[attr.id] || "";
            const hasValue = value && value.trim() !== "";

            return (
              <div key={attr.id}>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">
                    {attr.attributeName || "Attribute"}
                  </Label>
                  <div className="text-sm text-foreground">
                    {hasValue ? (
                      <span className="font-medium">
                        {formatValue(value, attr.valueDataType, attr.unitOfMeasure)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">No value set</span>
                    )}
                  </div>
                </div>
                {index < productAttributes.length - 1 && (
                  <Separator className="mt-3" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
