import { Card } from "@/components/ui/card";
import { UnitOfMeasureViewProps } from "./types";
import { UnitIcon } from "./components/UnitIcon";
import { UnitStatus } from "./components/UnitStatus";
import { UnitActions } from "./components/UnitActions";
import { UnitInfo } from "./components/UnitInfo";

export const UnitOfMeasureCardView = ({
  unit,
  onEdit,
  onDelete,
  getBaseUnitName,
}: UnitOfMeasureViewProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-border)] transition-all shadow-sm hover:shadow-md group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <UnitIcon />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-foreground text-base group-hover:text-[var(--accent-primary)] transition-colors">
                {unit.unitName}
              </h3>
              <UnitStatus isActive={unit.isActive} />
            </div>
            <UnitInfo unit={unit} getBaseUnitName={getBaseUnitName} variant="grid" />
          </div>
        </div>
        <UnitActions
          unit={unit}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </Card>
  );
};
