import { CompanyProductCardProps } from "./types";
import { CompanyProductCardView } from "./CompanyProductCardView";
import { CompanyProductListView } from "./CompanyProductListView";

export const CompanyProductCard = ({
  product,
  viewMode,
  onDelete,
  onView
}: CompanyProductCardProps) => {
  if (viewMode === "list") {
    return (
      <CompanyProductListView
        product={product}
        onView={onView}
        onDelete={onDelete}
      />
    );
  }

  return (
    <CompanyProductCardView
      product={product}
      onView={onView}
      onDelete={onDelete}
    />
  );
};
