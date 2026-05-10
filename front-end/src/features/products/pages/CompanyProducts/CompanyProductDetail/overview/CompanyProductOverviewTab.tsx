import type { CompanyProduct } from "@/features/products/services/productApi";
import { CompanyProductVariant } from "@/features/products/services/companyProductVariants";
import { formatAvatarUrl } from "@/shared/utils";
import { CompanyProductDetailImage } from "./CompanyProductDetailImage";
import { CompanyProductDetailInfo } from "./CompanyProductDetailInfo";
import { CompanyProductDetailTags } from "./CompanyProductDetailTags";
import { CompanyProductDetailNotes } from "./CompanyProductDetailNotes";
import { CompanyProductAttributesDisplay } from "./CompanyProductAttributesDisplay";
import { CompanyProductPriceStockDisplay } from "./CompanyProductPriceStockDisplay";

interface CompanyProductOverviewTabProps {
  product: CompanyProduct;
  variants: CompanyProductVariant[];
  variantsLoading: boolean;
  selectedVariantId: string | null;
  onVariantSelect: (variant: CompanyProductVariant | null) => void;
}

export const CompanyProductOverviewTab = ({
  product,
  variants,
  variantsLoading,
  selectedVariantId,
  onVariantSelect,
}: CompanyProductOverviewTabProps) => {
  const imageUrl = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : formatAvatarUrl(product.imageUrl)
    : undefined;

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Product Image */}
      <div className="space-y-6">
        <CompanyProductDetailImage
          imageUrl={imageUrl}
          productName={product.name || "Product"}
        />
      </div>

      {/* Right Side - Attributes (with embedded variant picker), Price & Stock, and Information */}
      <div className="space-y-6">
        {product.systemProductId && (
          <CompanyProductAttributesDisplay
            systemProductId={product.systemProductId}
            variants={variants}
            variantsLoading={variantsLoading}
            selectedVariantId={selectedVariantId}
            onVariantSelect={onVariantSelect}
          />
        )}

        <CompanyProductPriceStockDisplay
          selectedVariant={selectedVariant}
          companyId={product.companyId}
        />

        <CompanyProductDetailInfo product={product} />

        {product.tags && product.tags.length > 0 && (
          <CompanyProductDetailTags tags={product.tags} />
        )}

        {product.notes && <CompanyProductDetailNotes notes={product.notes} />}
      </div>
    </div>
  );
};
