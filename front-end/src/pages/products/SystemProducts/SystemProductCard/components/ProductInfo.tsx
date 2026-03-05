import { Users, CheckCircle } from "lucide-react";
import { DateDisplay } from "../../../../../components/common/DateDisplay";
import { ProductInfoProps } from "../types";

export const ProductInfo = ({ product, variant = "grid" }: ProductInfoProps) => {
  if (variant === "list") {
    return (
      <>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{product.usageCount} companies</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="truncate"><DateDisplay date={product.lastModified} /></span>
          </div>
        </div>
        <p className="text-sm text-foreground mb-3 line-clamp-2">{product.description}</p>
      </>
    );
  }

  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Usage:</span>
        <span className="text-card-foreground">{product.usageCount} companies</span>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
      <div className="pt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Modified: <DateDisplay date={product.lastModified} /></span>
          <span>ID: {product.id}</span>
        </div>
      </div>
    </div>
  );
};
