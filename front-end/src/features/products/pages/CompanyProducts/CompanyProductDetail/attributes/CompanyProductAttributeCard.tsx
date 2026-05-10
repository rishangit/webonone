import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductRelatedAttribute } from "@/features/products/services/productRelatedAttributes";
import { UnitsOfMeasure } from "@/features/products/services/unitsOfMeasure";

export interface CompanyProductAttributeCardProps {
  productAttr: ProductRelatedAttribute;
  unitsOfMeasure: UnitsOfMeasure[];
}

export const CompanyProductAttributeCard = ({
  productAttr,
  unitsOfMeasure,
}: CompanyProductAttributeCardProps) => {
  const unit = productAttr.unitOfMeasure
    ? unitsOfMeasure.find((u) => u.id === productAttr.unitOfMeasure)
    : null;
  const allowedValues = productAttr.variantOptionValues?.filter((v) => v && v.trim() !== "") ?? [];

  return (
    <Card
      className={`p-6 backdrop-blur-xl border-[var(--glass-border)] transition-all duration-200 hover:border-[var(--accent-border)] ${
        productAttr.isVariantDefining
          ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/50"
          : "bg-[var(--glass-bg)] hover:bg-[var(--glass-bg)]/80"
      }`}
    >
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
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {productAttr.attributeDescription}
          </p>
        )}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
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
        </div>
        {allowedValues.length > 0 && (
          <div className="space-y-1.5 mt-3">
            <p className="text-xs text-muted-foreground">Allowed values</p>
            <div className="flex items-center gap-1.5 flex-wrap">
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
          </div>
        )}
      </div>
    </Card>
  );
};
