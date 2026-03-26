import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyProduct } from "@/services/companyProducts";
import { ProductImage } from "./components/ProductImage";
import { VariantSelector } from "./components/VariantSelector";
import { ProductActions } from "./components/ProductActions";
import { ProductStockInfo } from "./components/ProductStockInfo";
import { ProductPricing } from "./components/ProductPricing";
import { ProductTags } from "./components/ProductTags";
import { ProductAvailability } from "./components/ProductAvailability";
import { useCompanyProductCard } from "./hooks/useCompanyProductCard";

interface CompanyProductCardViewProps {
  product: CompanyProduct;
  onView?: (product: CompanyProduct) => void;
  onDelete?: (product: CompanyProduct) => void;
}

export const CompanyProductCardView = ({
  product,
  onView,
  onDelete
}: CompanyProductCardViewProps) => {
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
      className="overflow-hidden backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] group cursor-pointer"
      onClick={() => onView?.(product)}
    >
      <div className="relative">
        <ProductImage
          imageUrl={imageUrl}
          imageLoading={imageLoading}
          imageError={imageError}
          productName={product.name || 'Product'}
          stockStatus={selectedStockStatus}
          variant="grid"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
        {/* 3-dot menu top right - hidden for regular users */}
        {!isRegularUser && (
          <div className="absolute top-3 right-3">
            <ProductActions
              product={product}
              onView={onView}
              onDelete={onDelete}
            />
          </div>
        )}
        {/* Stock status badge bottom left */}
        <div className="absolute bottom-3 left-3">
          <Badge className={`${selectedStockStatus.color} backdrop-blur-sm border`}>
            {selectedStockStatus.status}
          </Badge>
        </div>
        {/* Variant count badge bottom right */}
        {variants.length > 0 && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="outline" className="backdrop-blur-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-400 dark:border-gray-600 font-semibold shadow-sm">
              {variants.length} {variants.length === 1 ? 'variant' : 'variants'}
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-card-foreground mb-1 truncate">{product.name || 'Unknown Product'}</h3>
            {product.description && (
              <p className="text-muted-foreground text-sm line-clamp-2 mb-1">{product.description}</p>
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
        </div>

        {variants.length > 0 && (
          <>
            <ProductStockInfo
              displayCurrentStock={displayValues.displayCurrentStock}
              displayMinStock={displayValues.displayMinStock}
              displayMaxStock={displayValues.displayMaxStock}
              displayStockUnit={displayValues.displayStockUnit}
              selectedVariant={selectedVariant}
              variant="grid"
            />
            <ProductPricing
              displayCostPrice={displayValues.displayCostPrice}
              displaySellPrice={displayValues.displaySellPrice}
              displayMargin={displayValues.displayMargin}
              selectedVariant={selectedVariant}
              formatPrice={formatPrice}
              variant="grid"
              hideCostAndMargin={isRegularUser}
            />
          </>
        )}

        {product.tags && product.tags.length > 0 && (
          <div className="mb-3">
            <ProductTags tags={product.tags} maxVisible={3} />
          </div>
        )}

        {!isRegularUser && (
          <div className="flex items-center justify-between pt-3 border-t border-[var(--glass-border)]">
            <ProductAvailability availabilityStatus={availabilityStatus} />
          </div>
        )}
      </div>
    </Card>
  );
};
