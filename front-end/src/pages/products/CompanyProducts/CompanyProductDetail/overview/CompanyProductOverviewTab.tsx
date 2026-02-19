import { useEffect } from "react";
import { CompanyProduct } from "../../../../../services/companyProducts";
import { CompanyProductVariant } from "../../../../../services/companyProductVariants";
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
  isEditing: boolean;
  formData: {
    notes: string;
    isAvailableForPurchase: boolean;
  };
  onFormChange: (field: string, value: any) => void;
}

export const CompanyProductOverviewTab = ({
  product,
  variants,
  variantsLoading,
  selectedVariantId,
  onVariantSelect,
  isEditing,
  formData,
  onFormChange,
}: CompanyProductOverviewTabProps) => {
  const imageUrl = product.imageUrl 
    ? (product.imageUrl.startsWith('http') ? product.imageUrl : formatAvatarUrl(product.imageUrl))
    : undefined;

  // Get the currently selected variant
  const selectedVariant = variants.find(v => v.id === selectedVariantId) || null;

  // Auto-select default variant or first variant if none selected
  useEffect(() => {
    if (!selectedVariantId && variants.length > 0 && !variantsLoading) {
      const defaultVariant = variants.find(v => v.isDefault);
      if (defaultVariant) {
        onVariantSelect(defaultVariant);
      } else if (variants.length > 0) {
        onVariantSelect(variants[0]);
      }
    }
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
          isEditing={isEditing}
          formData={formData}
          onFormChange={onFormChange}
        />

        {/* Product Attributes - Shows values for selected variant */}
        <CompanyProductAttributesDisplay
          systemProductId={product.systemProductId || null}
          selectedVariant={selectedVariant}
        />

        {product.tags && product.tags.length > 0 && (
          <CompanyProductDetailTags tags={product.tags} />
        )}

        {formData.notes && !isEditing && (
          <CompanyProductDetailNotes notes={formData.notes} />
        )}
      </div>
    </div>
  );
};
