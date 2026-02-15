import { Edit, Trash2, MoreVertical, Ruler } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../../components/ui/dropdown-menu";
import { UnitsOfMeasure } from "../../../services/unitsOfMeasure";

interface UnitOfMeasureCardProps {
  unit: UnitsOfMeasure;
  onEdit: (unit: UnitsOfMeasure) => void;
  onDelete: (unit: UnitsOfMeasure) => void;
  getBaseUnitName: (baseUnitId: string | null | undefined) => string;
}

export const UnitOfMeasureCard = ({
  unit,
  onEdit,
  onDelete,
  getBaseUnitName,
}: UnitOfMeasureCardProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-border)] transition-all shadow-sm hover:shadow-md group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-border)]/30 group-hover:from-[var(--accent-primary)]/30 group-hover:to-[var(--accent-primary)]/20 transition-colors">
            <Ruler className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-2 text-base group-hover:text-[var(--accent-primary)] transition-colors">{unit.unitName}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Symbol: <span className="font-mono font-semibold">{unit.symbol}</span>
            </p>
            {(unit.baseUnit || unit.multiplier !== 1.0) && (
              <div className="space-y-1 mb-3">
                {unit.baseUnit && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Base Unit:</span> {getBaseUnitName(unit.baseUnit)}
                  </p>
                )}
                {unit.multiplier !== 1.0 && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Multiplier:</span> {unit.multiplier}
                  </p>
                )}
              </div>
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
            <DropdownMenuItem onClick={() => onEdit(unit)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(unit)}
              className="text-red-500"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={unit.isActive ? "default" : "secondary"} className="text-xs">
          {unit.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>
    </Card>
  );
};
