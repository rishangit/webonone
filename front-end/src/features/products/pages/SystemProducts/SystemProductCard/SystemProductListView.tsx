import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { LIST_CARD_LIST_SHELL } from "@/components/common/CardKebabTrigger";
import {
  ListCardContent,
  ListCardDetailsHeader,
  ListCardMediaColumn,
} from "@/components/common/ListCardLayout";
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

  const hasTags = (product.tags?.length ?? 0) > 0;

  return (
    <Card className={LIST_CARD_LIST_SHELL} onClick={handleCardClick}>
      <ListCardMediaColumn>
        <ProductImage imageUrl={product.imageUrl} productName={product.name} variant="list" />
      </ListCardMediaColumn>

      <ListCardContent>
        <ListCardDetailsHeader
          title={product.name}
          description={product.description}
          status={<ProductStatus isActive={product.isActive} isVerified={product.isVerified} variant="list" />}
          actions={
            <ProductActions
              product={product}
              onViewProduct={onViewProduct}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              triggerVariant="default"
            />
          }
          tags={hasTags ? <ProductTags tags={product.tags} variant="list" /> : undefined}
        />
        <ProductInfo product={product} variant="list" />
      </ListCardContent>
    </Card>
  );
};
