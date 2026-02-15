import { Edit, Trash2, MoreVertical, ListChecks } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../../components/ui/dropdown-menu";
import { SystemProductAttribute } from "../../../services/systemProductAttributes";
import { UnitsOfMeasure } from "../../../services/unitsOfMeasure";

interface ProductAttributeListItemProps {
  attribute: SystemProductAttribute;
  unitsOfMeasure: UnitsOfMeasure[];
  onEdit: (attribute: SystemProductAttribute) => void;
  onDelete: (attribute: SystemProductAttribute) => void;
}

export const ProductAttributeListItem = ({
  attribute,
  unitsOfMeasure,
  onEdit,
  onDelete,
}: ProductAttributeListItemProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-border)] transition-all shadow-sm hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-border)]/30">
          <ListChecks className="w-6 h-6 text-[var(--accent-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1 mr-2">
              <h3 className="font-semibold text-foreground mb-1 truncate text-lg">{attribute.name}</h3>
              {attribute.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {attribute.description}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex-shrink-0 h-8 w-8 p-0">
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
        </div>
      </div>
    </Card>
  );
};
