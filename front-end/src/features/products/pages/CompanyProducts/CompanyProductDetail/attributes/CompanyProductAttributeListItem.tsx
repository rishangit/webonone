import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductRelatedAttribute } from "@/features/products/services/productRelatedAttributes";
import { UnitsOfMeasure } from "@/features/products/services/unitsOfMeasure";

export interface CompanyProductAttributeListItemProps {
  productAttr: ProductRelatedAttribute;
  unitsOfMeasure: UnitsOfMeasure[];
}

export const CompanyProductAttributeListItem = ({
  productAttr,
  unitsOfMeasure,
}: CompanyProductAttributeListItemProps) => {
  const unit = productAttr.unitOfMeasure
    ? unitsOfMeasure.find((u) => u.id === productAttr.unitOfMeasure)
    : null;
  const allowedValues = productAttr.variantOptionValues?.filter((v) => v && v.trim() !== "") ?? [];

  return (
    <Card
      className={`p-4 backdrop-blur-xl border-[var(--glass-border)] transition-all duration-200 hover:border-[var(--accent-border)] ${
        productAttr.isVariantDefining
          ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/50"
          : "bg-[var(--glass-bg)] hover:bg-[var(--glass-bg)]/80"
      }`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-semibold text-foreground">
              {productAttr.attributeName || "Attribute"}
            </h4>
            {productAttr.isVariantDefining && (
              <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs">
                <Star className="w-3 h-3 mr-1 fill-current" /> Variant-Defining
              </Badge>
            )}
          </div>
          {productAttr.attributeDescription && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {productAttr.attributeDescription}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap lg:flex-shrink-0">
          {productAttr.valueDataType && (
            <Badge variant="outline" className="text-xs border-[var(--glass-border)]">
              {productAttr.valueDataType}
            </Badge>
          )}
          {unit && (
            <Badge variant="outline" className="text-xs border-[var(--glass-border)]">
              {unit.symbol}
            </Badge>
          )}
          {allowedValues.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground">Values:</span>
              {allowedValues.map((value) => (
                <Badge
                  key={value}
                  variant="outline"
                  className="text-xs border-[var(--glass-border)] bg-[var(--input-background)] text-foreground"
                >
                  {value}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
