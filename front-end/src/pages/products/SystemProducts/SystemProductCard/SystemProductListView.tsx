import { useNavigate } from "react-router-dom";
import { Card } from "../../../../components/ui/card";
import { SystemProductViewProps } from "./types";
import { ProductImage } from "./components/ProductImage";
import { ProductStatus } from "./components/ProductStatus";
import { ProductActions } from "./components/ProductActions";
import { ProductTags } from "./components/ProductTags";
import { ProductInfo } from "./components/ProductInfo";

export const SystemProductListView = ({
  product,
  onViewProduct,
  onEdit,
  onDelete,
  onToggleStatus,
}: SystemProductViewProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/system/system-products/${product.id}`);
  };

  return (
    <Card 
      className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)] cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-4">
        <ProductImage 
          imageUrl={product.imageUrl} 
          productName={product.name} 
          variant="list"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1 mr-2">
              <h3 className="font-medium text-foreground text-base sm:text-lg truncate">{product.name}</h3>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ProductStatus 
                isActive={product.isActive} 
                isVerified={product.isVerified} 
                variant="list"
              />
              <ProductActions
                product={product}
                onViewProduct={onViewProduct}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
              />
            </div>
          </div>

          <ProductInfo product={product} variant="list" />

          <ProductTags tags={product.tags} variant="list" />
        </div>
      </div>
    </Card>
  );
};
