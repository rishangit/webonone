import { Badge } from "../../../../../components/ui/badge";
import { AttributeInfoProps } from "../types";

export const AttributeInfo = ({ attribute, unit, variant = "grid" }: AttributeInfoProps) => {
  const isList = variant === "list";
  
  return (
    <div className={`flex items-center gap-2 flex-wrap ${isList ? "mt-2" : "mt-2"}`}>
      <Badge variant="outline" className="text-xs border-[var(--glass-border)]">
        {attribute.valueDataType}
      </Badge>
      {unit && (
        <Badge variant="outline" className="text-xs border-[var(--glass-border)]">
          {isList ? `Unit: ${unit.symbol}` : unit.symbol}
        </Badge>
      )}
    </div>
  );
};
