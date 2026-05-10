import { Trash2, Star, MoreVertical, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SystemProductAttribute } from "@/features/products/services/systemProductAttributes";
import { ProductRelatedAttribute } from "@/features/products/services/productRelatedAttributes";
import { UnitsOfMeasure } from "@/features/products/services/unitsOfMeasure";

export interface ProductAttributeCardProps {
  productAttr: ProductRelatedAttribute;
  systemAttr: SystemProductAttribute;
  unitsOfMeasure: UnitsOfMeasure[];
  onToggleVariantDefining: (productAttr: ProductRelatedAttribute) => void;
  onDelete: (id: string) => void;
  onSetValues?: (productAttr: ProductRelatedAttribute) => void;
}

export const ProductAttributeCard = ({
  productAttr,
  systemAttr,
  unitsOfMeasure,
  onToggleVariantDefining,
  onDelete,
  onSetValues,
}: ProductAttributeCardProps) => {
  const unit = systemAttr.unitOfMeasure
    ? unitsOfMeasure.find((u) => u.id === systemAttr.unitOfMeasure)
    : null;

  return (
    <Card
      className={`p-6 backdrop-blur-xl border-[var(--glass-border)] transition-all duration-200 hover:border-[var(--accent-border)] ${
        productAttr.isVariantDefining
          ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/50"
          : "bg-[var(--glass-bg)] hover:bg-[var(--glass-bg)]/80"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground">{systemAttr.name}</h4>
            {productAttr.isVariantDefining && (
              <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs">
                <Star className="w-3 h-3 mr-1 fill-current" /> Variant-Defining
              </Badge>
            )}
          </div>
          {systemAttr.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{systemAttr.description}</p>
          )}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs border-[var(--glass-border)]">
              {systemAttr.valueDataType}
            </Badge>
            {systemAttr.unitOfMeasure && (
              <Badge variant="outline" className="text-xs border-[var(--glass-border)]">
                {unit ? unit.symbol : systemAttr.unitOfMeasure}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Checkbox
              id={`variant-defining-${productAttr.id}`}
              checked={productAttr.isVariantDefining}
              onCheckedChange={() => onToggleVariantDefining(productAttr)}
              className="mr-2"
            />
            <Label htmlFor={`variant-defining-${productAttr.id}`} className="text-sm text-foreground cursor-pointer">
              Use as variant-defining attribute
            </Label>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/50"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-popover border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem
              onClick={() => onToggleVariantDefining(productAttr)}
              className="text-foreground hover:bg-accent"
            >
              <Star className="w-4 h-4 mr-2" />
              {productAttr.isVariantDefining ? "Unmark as Variant-Defining" : "Mark as Variant-Defining"}
            </DropdownMenuItem>
            {onSetValues && (
              <DropdownMenuItem
                onClick={() => onSetValues(productAttr)}
                className="text-foreground hover:bg-accent"
              >
                <ListChecks className="w-4 h-4 mr-2" />
                Set values
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(productAttr.id)}
              className="text-red-600 dark:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Attribute
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
