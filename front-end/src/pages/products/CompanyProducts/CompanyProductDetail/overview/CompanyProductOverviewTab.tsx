import { useEffect } from "react";
import { CompanyProduct } from "@/services/companyProducts";
import { CompanyProductVariant } from "@/services/companyProductVariants";
import { formatAvatarUrl } from "../../../../../utils";
import { CompanyProductDetailImage } from "./CompanyProductDetailImage";
import { CompanyProductDetailInfo } from "./CompanyProductDetailInfo";
import { CompanyProductDetailTags } from "./CompanyProductDetailTags";
import { CompanyProductDetailNotes } from "./CompanyProductDetailNotes";
import { CompanyProductAttributesDisplay } from "./CompanyProductAttributesDisplay";

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
    ? (product.imageUrl.startsWith('http') ? product.imageUrl : formatAvatarUrl(product.imageUrl))
    : undefined;

  // Get the currently selected variant
  const selectedVariant = variants.find(v => v.id === selectedVariantId) || null;

  // Auto-select default variant (or first) when selection is missing/invalid.
  useEffect(() => {
    if (variantsLoading) return;

    if (variants.length === 0) {
      if (selectedVariantId) onVariantSelect(null);
      return;
    }

    const selectedVariantExists = selectedVariantId
      ? variants.some((variant) => variant.id === selectedVariantId)
      : false;

    if (selectedVariantExists) return;

    const defaultVariant = variants.find((variant) => variant.isDefault);
    onVariantSelect(defaultVariant || variants[0]);
  }, [variants, selectedVariantId, variantsLoading, onVariantSelect]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Product Image */}
      <div className="space-y-6">
        <CompanyProductDetailImage
          imageUrl={imageUrl}
          productName={product.name || 'Product'}
        />
      </div>

      {/* Right Side - Product Information */}
      <div className="space-y-6">
        <CompanyProductDetailInfo
          product={product}
          variants={variants}
          variantsLoading={variantsLoading}
          selectedVariantId={selectedVariantId}
          selectedVariant={selectedVariant}
          onVariantSelect={onVariantSelect}
        />

        {/* Product Attributes - Shows values for selected variant */}
        <CompanyProductAttributesDisplay
          systemProductId={product.systemProductId || null}
          selectedVariant={selectedVariant}
        />

        {product.tags && product.tags.length > 0 && (
          <CompanyProductDetailTags tags={product.tags} />
        )}

        {product.notes && (
          <CompanyProductDetailNotes notes={product.notes} />
        )}
      </div>
    </div>
  );
};
