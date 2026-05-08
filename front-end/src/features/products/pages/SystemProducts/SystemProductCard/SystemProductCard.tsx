import { SystemProductCardProps } from "./types";
import { SystemProductCardView } from "./SystemProductCardView";
import { SystemProductListView } from "./SystemProductListView";

export const SystemProductCard = ({
  product,
  onViewProduct,
  onEdit,
  onDelete,
  onToggleStatus,
  viewMode = "grid",
}: SystemProductCardProps) => {
  if (viewMode === "list") {
    return (
      <SystemProductListView
        product={product}
        onViewProduct={onViewProduct}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
      />
    );
  }

  return (
    <SystemProductCardView
      product={product}
      onViewProduct={onViewProduct}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleStatus={onToggleStatus}
    />
  );
};
