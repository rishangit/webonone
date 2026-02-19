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
  const unit = attribute.unitOfMeasure 
    ? unitsOfMeasure.find(u => u.id === attribute.unitOfMeasure)
    : null;

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-border)] transition-all shadow-sm hover:shadow-md group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-border)]/30 group-hover:from-[var(--accent-primary)]/30 group-hover:to-[var(--accent-primary)]/20 transition-colors">
            <ListChecks className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-foreground text-base group-hover:text-[var(--accent-primary)] transition-colors">{attribute.name}</h3>
              <Badge className={attribute.isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                {attribute.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {attribute.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                {attribute.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <Badge variant="outline" className="text-xs border-[var(--glass-border)]">{attribute.valueDataType}</Badge>
              {unit && (
                <Badge variant="outline" className="text-xs border-[var(--glass-border)]">
                  {unit.symbol}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/50">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem onClick={() => onEdit(attribute)} className="text-foreground hover:bg-accent">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(attribute)}
              className="text-red-600 dark:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
