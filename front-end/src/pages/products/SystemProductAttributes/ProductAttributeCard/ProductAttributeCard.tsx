import { ProductAttributeCardProps } from "./types";
import { ProductAttributeCardView } from "./ProductAttributeCardView";
import { ProductAttributeListView } from "./ProductAttributeListView";

export const ProductAttributeCard = ({
  attribute,
  unitsOfMeasure,
  onEdit,
  onDelete,
  viewMode = "grid",
}: ProductAttributeCardProps) => {
  if (viewMode === "list") {
    return (
      <ProductAttributeListView
        attribute={attribute}
        unitsOfMeasure={unitsOfMeasure}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }

  return (
    <ProductAttributeCardView
      attribute={attribute}
      unitsOfMeasure={unitsOfMeasure}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};
