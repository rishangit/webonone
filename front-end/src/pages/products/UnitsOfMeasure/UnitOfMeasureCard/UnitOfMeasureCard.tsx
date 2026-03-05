import { UnitOfMeasureCardProps } from "./types";
import { UnitOfMeasureCardView } from "./UnitOfMeasureCardView";
import { UnitOfMeasureListView } from "./UnitOfMeasureListView";

export const UnitOfMeasureCard = ({
  unit,
  onEdit,
  onDelete,
  getBaseUnitName,
  viewMode = "grid",
}: UnitOfMeasureCardProps) => {
  if (viewMode === "list") {
    return (
      <UnitOfMeasureListView
        unit={unit}
        onEdit={onEdit}
        onDelete={onDelete}
        getBaseUnitName={getBaseUnitName}
      />
    );
  }

  return (
    <UnitOfMeasureCardView
      unit={unit}
      onEdit={onEdit}
      onDelete={onDelete}
      getBaseUnitName={getBaseUnitName}
    />
  );
};
