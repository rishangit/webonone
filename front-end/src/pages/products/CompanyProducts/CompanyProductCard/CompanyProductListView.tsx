import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Package, DollarSign, TrendingUp } from "lucide-react";
import { CompanyProduct } from "../../../../services/companyProducts";
import { ProductImage } from "./components/ProductImage";
import { VariantSelector } from "./components/VariantSelector";
import { ProductActions } from "./components/ProductActions";
import { ProductStockInfo } from "./components/ProductStockInfo";
import { ProductPricing } from "./components/ProductPricing";
import { ProductTags } from "./components/ProductTags";
import { ProductAvailability } from "./components/ProductAvailability";
import { useCompanyProductCard } from "./hooks/useCompanyProductCard";

interface CompanyProductListViewProps {
  product: CompanyProduct;
  onView?: (product: CompanyProduct) => void;
  onDelete?: (product: CompanyProduct) => void;
}

export const CompanyProductListView = ({
  product,
  onView,
  onDelete
}: CompanyProductListViewProps) => {
  const {
    imageUrl,
    imageLoading,
    imageError,
    variants,
    selectedVariantId,
    selectedVariant,
    selectedStockStatus,
    availabilityStatus,
    displayValues,
    formatPrice,
    isRegularUser,
    setSelectedVariantId,
    setImageLoading,
    setImageError
  } = useCompanyProductCard(product);

  return (
    <Card 
      className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)] cursor-pointer"
      onClick={() => onView?.(product)}
    >
      <div className="flex items-start gap-4 mb-4">
        <ProductImage
          imageUrl={imageUrl}
          imageLoading={imageLoading}
          imageError={imageError}
          productName={product.name || 'Product'}
          stockStatus={selectedStockStatus}
          variant="list"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1 mr-2">
              <h3 className="font-medium text-foreground text-base sm:text-lg truncate">{product.name || 'Unknown Product'}</h3>
              {product.description && (
                <p className="text-muted-foreground text-sm line-clamp-1">{product.description}</p>
              )}
              {product.sku && (
                <p className="text-muted-foreground text-xs">SKU: {product.sku}</p>
              )}
              <VariantSelector
                variants={variants}
                selectedVariantId={selectedVariantId}
                onVariantChange={setSelectedVariantId}
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {variants.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {variants.length} {variants.length === 1 ? 'variant' : 'variants'}
                </Badge>
              )}
              {!isRegularUser && (
                <ProductActions
                  product={product}
                  onView={onView}
                  onDelete={onDelete}
                />
              )}
            </div>
          </div>

          {variants.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">
                      {displayValues.displayCurrentStock}
                    </div>
                    <div className="text-xs">{displayValues.displayStockUnit}</div>
                  </div>
                </div>
                {!isRegularUser && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-foreground">{formatPrice(displayValues.displayCostPrice)}</div>
                      <div className="text-xs">{selectedVariant ? 'Cost' : 'Avg Cost'}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">{formatPrice(displayValues.displaySellPrice)}</div>
                    <div className="text-xs">{isRegularUser ? (selectedVariant ? 'Price' : 'Avg Price') : (selectedVariant ? 'Sell' : 'Avg Sell')}</div>
                  </div>
                </div>
                {!isRegularUser && displayValues.displayMargin && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-green-600 dark:text-green-400">{displayValues.displayMargin}%</div>
                      <div className="text-xs">Margin</div>
                    </div>
                  </div>
                )}
              </div>
              <ProductStockInfo
                displayCurrentStock={displayValues.displayCurrentStock}
                displayMinStock={displayValues.displayMinStock}
                displayMaxStock={displayValues.displayMaxStock}
                displayStockUnit={displayValues.displayStockUnit}
                selectedVariant={selectedVariant}
                variant="list"
              />
            </>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="mb-3">
              <ProductTags tags={product.tags} maxVisible={3} />
            </div>
          )}

          {!isRegularUser && (
            <div className="flex items-center justify-between">
              <ProductAvailability availabilityStatus={availabilityStatus} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
