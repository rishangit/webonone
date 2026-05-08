import { Ruler } from "lucide-react";
import { Card } from "@/components/ui/card";
import { UnitOfMeasureViewProps } from "./types";
import { UnitStatus } from "./components/UnitStatus";
import { UnitActions } from "./components/UnitActions";
import { UnitInfo } from "./components/UnitInfo";

export const UnitOfMeasureListView = ({
  unit,
  onEdit,
  onDelete,
  getBaseUnitName,
}: UnitOfMeasureViewProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-border)] transition-all shadow-sm hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-border)]/30">
          <Ruler className="w-6 h-6 text-[var(--accent-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1 mr-2">
              <h3 className="font-semibold text-foreground mb-1 truncate text-lg">{unit.unitName}</h3>
              <UnitInfo unit={unit} getBaseUnitName={getBaseUnitName} variant="list" />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <UnitStatus isActive={unit.isActive} />
              <UnitActions
                unit={unit}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
