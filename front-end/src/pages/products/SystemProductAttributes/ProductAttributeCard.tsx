import { Edit, Trash2, MoreVertical, ListChecks } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../../components/ui/dropdown-menu";
import { SystemProductAttribute } from "../../../services/systemProductAttributes";
import { UnitsOfMeasure } from "../../../services/unitsOfMeasure";

interface ProductAttributeCardProps {
  attribute: SystemProductAttribute;
  unitsOfMeasure: UnitsOfMeasure[];
  onEdit: (attribute: SystemProductAttribute) => void;
  onDelete: (attribute: SystemProductAttribute) => void;
}

export const ProductAttributeCard = ({
  attribute,
  unitsOfMeasure,
  onEdit,
  onDelete,
}: ProductAttributeCardProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-border)] transition-all shadow-sm hover:shadow-md group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-border)]/30 group-hover:from-[var(--accent-primary)]/30 group-hover:to-[var(--accent-primary)]/20 transition-colors">
            <ListChecks className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-2 text-base group-hover:text-[var(--accent-primary)] transition-colors">{attribute.name}</h3>
            {attribute.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                {attribute.description}
              </p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(attribute)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(attribute)}
              className="text-red-500"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={attribute.isActive ? "default" : "secondary"} className="text-xs">
          {attribute.isActive ? "Active" : "Inactive"}
        </Badge>
        <Badge variant="outline" className="text-xs">{attribute.valueDataType}</Badge>
        {attribute.unitOfMeasure && (
          <Badge variant="outline" className="text-xs">
            Unit: {unitsOfMeasure.find(u => u.id === attribute.unitOfMeasure)?.symbol || attribute.unitOfMeasure}
          </Badge>
        )}
      </div>
    </Card>
  );
};
