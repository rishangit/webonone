import { Package, AlertTriangle } from "lucide-react";
import { Card } from "../../../../../components/ui/card";
import { Badge } from "../../../../../components/ui/badge";
import { CardTitle } from "../../../../../components/common/CardTitle";
import { ImageWithFallback } from "../../../../../components/figma/ImageWithFallback";
import { formatAvatarUrl } from "../../../../../utils";
import { VariantInfoSidebarProps } from "../types";

export const VariantInfoSidebar = ({
  variant,
  productName,
  productImageUrl,
}: VariantInfoSidebarProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--accent-border)]/30 shadow-lg">
        <CardTitle title="Variant Information" icon={Package} />
        <div className="space-y-3">
          {productName && (
            <div className="flex items-center gap-3">
              {productImageUrl && (
                <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={productImageUrl.startsWith('http') 
                      ? productImageUrl 
                      : formatAvatarUrl(productImageUrl)}
                    alt={productName}
                    className="w-full h-full object-cover"
                    fallbackSrc="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=96&h=96&fit=crop"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Product</p>
                <p className="font-medium text-foreground truncate">{productName}</p>
              </div>
            </div>
          )}
          
          <div>
            <p className="text-sm text-muted-foreground">Variant Name</p>
            <p className="font-medium text-foreground">{variant.name}</p>
          </div>
          {variant.sku && (
            <div>
              <p className="text-sm text-muted-foreground">SKU</p>
              <p className="font-medium text-foreground">{variant.sku}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge className={variant.isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
              {variant.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          {(variant.minStock !== undefined || variant.maxStock !== undefined) && (
            <>
              {variant.minStock !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">Min Stock</p>
                  <p className="font-medium text-foreground">{variant.minStock}</p>
                </div>
              )}
              {variant.maxStock !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">Max Stock</p>
                  <p className="font-medium text-foreground">{variant.maxStock}</p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
