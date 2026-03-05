import { ListChecks } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { ProductAttributeViewProps } from "./types";
import { AttributeStatus } from "./components/AttributeStatus";
import { AttributeActions } from "./components/AttributeActions";
import { AttributeInfo } from "./components/AttributeInfo";

export const ProductAttributeListView = ({
  attribute,
  unitsOfMeasure,
  onEdit,
  onDelete,
}: ProductAttributeViewProps) => {
  const unit = attribute.unitOfMeasure 
    ? unitsOfMeasure.find(u => u.id === attribute.unitOfMeasure)
    : null;

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-border)] transition-all shadow-sm hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-border)]/30">
          <ListChecks className="w-6 h-6 text-[var(--accent-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1 mr-2">
              <h3 className="font-semibold text-foreground mb-1 truncate text-lg">
                {attribute.name}
              </h3>
              {attribute.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {attribute.description}
                </p>
              )}
            </div>
            <AttributeActions
              attribute={attribute}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <AttributeStatus isActive={attribute.isActive} />
            <AttributeInfo attribute={attribute} unit={unit} variant="list" />
          </div>
        </div>
      </div>
    </Card>
  );
};
