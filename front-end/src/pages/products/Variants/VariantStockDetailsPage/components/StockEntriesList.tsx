import { Package, Plus } from "lucide-react";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import { StockEntriesListProps } from "../types";
import { StockEntryCard } from "./StockEntryCard";

export const StockEntriesList = ({
  entries,
  variant,
  formatPrice,
  onAddStock,
  onEdit,
  onDelete,
  onSetAsActive,
}: StockEntriesListProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--accent-border)]/30 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-[var(--accent-primary)]" />
          <h3 className="font-semibold text-foreground">Stock Entries</h3>
        </div>
        <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
          {entries.length} entries
        </Badge>
      </div>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No stock entries found</p>
            <Button
              onClick={onAddStock}
              variant="accent"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Stock Entry
            </Button>
          </div>
        ) : (
          entries.map((entry) => (
            <StockEntryCard
              key={entry.id}
              entry={entry}
              variant={variant}
              formatPrice={formatPrice}
              onEdit={onEdit}
              onDelete={onDelete}
              onSetAsActive={onSetAsActive}
            />
          ))
        )}
      </div>
    </Card>
  );
};
