import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LIST_CARD_LIST_SHELL } from "@/components/common/CardKebabTrigger";
import {
  ListCardContent,
  ListCardDetailDivider,
  ListCardDetailField,
  ListCardDetailGrid,
  ListCardDetailsHeader,
  ListCardMediaColumn,
  ListCardPriceFooter,
} from "@/components/common/ListCardLayout";
import { Package, DollarSign } from "lucide-react";
import type { CompanyProduct } from '@/features/products/services/productApi';
import { ProductImage } from "./components/ProductImage";
import { VariantSelector } from "./components/VariantSelector";
import { ProductActions } from "./components/ProductActions";
import { ProductTags } from "./components/ProductTags";
import { ProductAvailability } from "./components/ProductAvailability";
import { useCompanyProductCard } from "@/features/products/hooks";

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

  const headerDescription = (
    <>
      {product.description ? <span className="block">{product.description}</span> : null}
      {product.sku ? <span className="mt-1 block text-xs">SKU: {product.sku}</span> : null}
    </>
  );

  const priceLabel = isRegularUser
    ? selectedVariant
      ? formatPrice(displayValues.displaySellPrice)
      : `Avg ${formatPrice(displayValues.displaySellPrice)}`
    : selectedVariant
      ? formatPrice(displayValues.displaySellPrice)
      : `Avg ${formatPrice(displayValues.displaySellPrice)}`;

  const stockStatusBadge = (
    <Badge className={`${selectedStockStatus.color} border text-xs`}>
      {selectedStockStatus.status}
    </Badge>
  );

  const hasTags = (product.tags?.length ?? 0) > 0;

  return (
    <Card className={LIST_CARD_LIST_SHELL} onClick={() => onView?.(product)}>
      <ListCardMediaColumn>
        <ProductImage
          imageUrl={imageUrl}
          imageLoading={imageLoading}
          imageError={imageError}
          productName={product.name || "Product"}
          stockStatus={selectedStockStatus}
          variant="list"
          showStockBadge={false}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      </ListCardMediaColumn>

      <ListCardContent>
        <ListCardDetailsHeader
          title={product.name || "Unknown Product"}
          description={product.description || product.sku ? headerDescription : undefined}
          status={stockStatusBadge}
          actions={
            !isRegularUser ? (
              <ProductActions
                product={product}
                onView={onView}
                onDelete={onDelete}
                triggerVariant="default"
              />
            ) : undefined
          }
          trailing={
            variants.length > 0 ? (
              <Badge variant="outline" className="flex-shrink-0 text-xs">
                {variants.length} {variants.length === 1 ? "variant" : "variants"}
              </Badge>
            ) : undefined
          }
          tags={hasTags ? <ProductTags tags={product.tags ?? []} maxVisible={3} /> : undefined}
        />
        <VariantSelector
          variants={variants}
          selectedVariantId={selectedVariantId}
          onVariantChange={setSelectedVariantId}
        />

        {variants.length > 0 ? (
          <>
            <ListCardDetailGrid className="mt-3">
              <ListCardDetailField
                icon={Package}
                label="Stock"
                value={`${displayValues.displayCurrentStock} ${displayValues.displayStockUnit}`}
              />
              {!isRegularUser ? (
                <ListCardDetailField
                  icon={DollarSign}
                  label={selectedVariant ? "Cost" : "Avg cost"}
                  value={formatPrice(displayValues.displayCostPrice)}
                />
              ) : (
                <ListCardDetailField label="Min stock" value={String(displayValues.displayMinStock)} />
              )}
              <ListCardDetailField label="Max stock" value={String(displayValues.displayMaxStock)} />
            </ListCardDetailGrid>
            <ListCardDetailDivider />
            <ListCardDetailGrid>
              {!isRegularUser && displayValues.displayMargin ? (
                <ListCardDetailField
                  label="Margin"
                  value={`${displayValues.displayMargin}%`}
                  className="[&_span:last-child]:text-green-600 [&_span:last-child]:dark:text-green-400"
                />
              ) : (
                <ListCardDetailField label="Min stock" value={String(displayValues.displayMinStock)} />
              )}
              <ListCardDetailField label="Availability">
                <ProductAvailability availabilityStatus={availabilityStatus} />
              </ListCardDetailField>
              <ListCardDetailField label="SKU" value={product.sku ?? "—"} />
            </ListCardDetailGrid>
          </>
        ) : null}

        {variants.length > 0 ? (
          <ListCardPriceFooter label={priceLabel} />
        ) : null}
      </ListCardContent>
    </Card>
  );
};
