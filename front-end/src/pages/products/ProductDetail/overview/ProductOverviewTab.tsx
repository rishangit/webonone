import { useEffect } from "react";
import { formatAvatarUrl } from "../../../../utils";
import { ProductDetailImage } from "./ProductDetailImage";
import { ProductDetailInfo } from "./ProductDetailInfo";
import { ProductDetailTags } from "./ProductDetailTags";
import { ProductDetailNotes } from "./ProductDetailNotes";
import { ProductAttributesDisplay } from "./ProductAttributesDisplay";
import { ProductVariant as SystemProductVariant } from "../../../../services/productVariants";

interface SystemProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  usageCount: number;
  createdDate: string;
  lastModified: string;
  tags: string[];
}

interface CompanyProduct {
  id: string;
  name: string;
  description: string;
  stock?: {
    current: number;
    unit: string;
  };
  [key: string]: any;
}

interface ProductOverviewTabProps {
  product: SystemProduct | CompanyProduct;
  variants?: SystemProductVariant[];
  variantsLoading?: boolean;
  selectedVariantId?: string | null;
  onVariantSelect?: (variant: SystemProductVariant | null) => void;
}

export const ProductOverviewTab = ({ 
  product, 
  variants = [],
  variantsLoading = false,
  selectedVariantId = null,
  onVariantSelect
}: ProductOverviewTabProps) => {
  const imageUrl = (product as any).imageUrl || (product as any).image;
  const formattedImageUrl = imageUrl 
    ? (imageUrl.startsWith('http') ? imageUrl : formatAvatarUrl(imageUrl))
    : undefined;

  // Get the currently selected variant
  const selectedVariant = variants.find(v => v.id === selectedVariantId) || null;

  // Auto-select default variant or first variant if none selected
  // This ensures selection happens even if parent component hasn't set it yet
  useEffect(() => {
    if (onVariantSelect && variants.length > 0 && !variantsLoading) {
      // Only auto-select if no variant is currently selected
      if (!selectedVariantId) {
        const defaultVariant = variants.find(v => v.isDefault);
        if (defaultVariant) {
          onVariantSelect(defaultVariant);
        } else {
          onVariantSelect(variants[0]);
        }
      } else {
        // If a variant is selected but it's not in the variants list, reselect
        const currentVariant = variants.find(v => v.id === selectedVariantId);
        if (!currentVariant) {
          const defaultVariant = variants.find(v => v.isDefault);
          if (defaultVariant) {
            onVariantSelect(defaultVariant);
          } else {
            onVariantSelect(variants[0]);
          }
        }
      }
    }
  }, [variants, selectedVariantId, variantsLoading, onVariantSelect]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Product Image */}
      <div className="space-y-6">
        <ProductDetailImage
          imageUrl={formattedImageUrl}
          productName={product.name}
        />
      </div>

      {/* Right Side - Product Information */}
      <div className="space-y-6">
        <ProductDetailInfo 
          product={product}
          variants={variants}
          variantsLoading={variantsLoading}
          selectedVariantId={selectedVariantId}
          selectedVariant={selectedVariant}
          onVariantSelect={onVariantSelect}
        />

        {/* Product Attributes - Shows values for selected variant */}
        {product.id && (
          <ProductAttributesDisplay
            productId={product.id}
            selectedVariant={selectedVariant}
          />
        )}

        {product.tags && product.tags.length > 0 && (
          <ProductDetailTags tags={product.tags} />
        )}

        {(product as any).notes && (
          <ProductDetailNotes notes={(product as any).notes} />
        )}
      </div>
    </div>
  );
};
