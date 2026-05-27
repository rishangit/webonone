import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { CardGridKebabSlot } from "@/components/common/CardGridKebabSlot";
import { LIST_CARD_GRID_SHELL } from "@/components/common/CardKebabTrigger";
import { SystemProductViewProps } from "./types";
import { ProductImage } from "./components/ProductImage";
import { ProductStatus } from "./components/ProductStatus";
import { ProductActions } from "./components/ProductActions";
import { ProductTags } from "./components/ProductTags";
import { ProductInfo } from "./components/ProductInfo";

export const SystemProductCardView = ({
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
    <Card className={LIST_CARD_GRID_SHELL} onClick={handleCardClick}>
      <div className="relative">
        <ProductImage 
          imageUrl={product.imageUrl} 
          productName={product.name} 
          variant="grid"
        />
        <div className="absolute top-3 left-3">
          <ProductStatus 
            isActive={product.isActive} 
            isVerified={product.isVerified} 
            variant="grid"
          />
        </div>
        <CardGridKebabSlot>
          <ProductActions
            product={product}
            onViewProduct={onViewProduct}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            triggerVariant="overlay"
          />
        </CardGridKebabSlot>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-card-foreground mb-1 truncate">{product.name}</h3>
          </div>
        </div>

        <ProductInfo product={product} variant="grid" />

        <ProductTags tags={product.tags} variant="grid" />
      </div>
    </Card>
  );
};
