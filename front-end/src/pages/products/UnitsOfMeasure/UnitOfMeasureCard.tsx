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
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-border)]/30 group-hover:from-[var(--accent-primary)]/30 group-hover:to-[var(--accent-primary)]/20 transition-colors">
            <Ruler className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-foreground text-base group-hover:text-[var(--accent-primary)] transition-colors">{unit.unitName}</h3>
              <Badge className={unit.isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                {unit.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Symbol: <span className="font-mono font-semibold text-foreground">{unit.symbol}</span>
            </p>
            {(unit.baseUnit || unit.multiplier !== 1.0) && (
              <div className="space-y-1 mt-2">
                {unit.baseUnit && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Base Unit:</span> <span className="text-foreground">{getBaseUnitName(unit.baseUnit)}</span>
                  </p>
                )}
                {unit.multiplier !== 1.0 && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Multiplier:</span> <span className="text-foreground">{unit.multiplier}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/50">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem onClick={() => onEdit(unit)} className="text-foreground hover:bg-accent">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(unit)}
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
