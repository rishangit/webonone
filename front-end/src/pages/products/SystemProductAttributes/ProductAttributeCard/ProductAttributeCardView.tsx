import { Card } from "../../../../components/ui/card";
import { ProductAttributeViewProps } from "./types";
import { AttributeIcon } from "./components/AttributeIcon";
import { AttributeStatus } from "./components/AttributeStatus";
import { AttributeActions } from "./components/AttributeActions";
import { AttributeInfo } from "./components/AttributeInfo";

export const ProductAttributeCardView = ({
  attribute,
  unitsOfMeasure,
  onEdit,
  onDelete,
}: ProductAttributeViewProps) => {
  const unit = attribute.unitOfMeasure 
    ? unitsOfMeasure.find(u => u.id === attribute.unitOfMeasure)
    : null;

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-border)] transition-all shadow-sm hover:shadow-md group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <AttributeIcon />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-foreground text-base group-hover:text-[var(--accent-primary)] transition-colors">
                {attribute.name}
              </h3>
              <AttributeStatus isActive={attribute.isActive} />
            </div>
            {attribute.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                {attribute.description}
              </p>
            )}
            <AttributeInfo attribute={attribute} unit={unit} variant="grid" />
          </div>
        </div>
        <AttributeActions
          attribute={attribute}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </Card>
  );
};
