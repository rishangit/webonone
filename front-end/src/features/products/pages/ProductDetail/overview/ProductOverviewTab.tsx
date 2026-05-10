import { formatAvatarUrl } from "@/shared/utils";
import { ProductDetailImage } from "./ProductDetailImage";
import { ProductDetailInfo } from "./ProductDetailInfo";
import { ProductDetailTags } from "./ProductDetailTags";
import { ProductDetailNotes } from "./ProductDetailNotes";
import { ProductAttributesDisplay } from "./ProductAttributesDisplay";
import { ProductVariant as SystemProductVariant } from "@/features/products/services/productVariants";

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Product Image */}
      <div className="space-y-6">
        <ProductDetailImage
          imageUrl={formattedImageUrl}
          productName={product.name}
        />
      </div>

      {/* Right Side - Product Attributes and Information */}
      <div className="space-y-6">
        {/* Product Attributes — embeds variant configuration and resolved values */}
        {product.id && (
          <ProductAttributesDisplay
            productId={product.id}
            variants={variants}
            variantsLoading={variantsLoading}
            selectedVariantId={selectedVariantId}
            onVariantSelect={onVariantSelect}
          />
        )}

        <ProductDetailInfo product={product} />

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
