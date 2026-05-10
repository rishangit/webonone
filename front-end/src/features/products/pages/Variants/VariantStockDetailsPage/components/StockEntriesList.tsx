import { Package, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
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
          <EmptyState
            className="!p-8 border-0 shadow-none bg-transparent"
            icon={Package}
            title="No stock entries"
            description="Add a stock entry to track quantity and pricing for this variant."
            action={{
              label: "Add first stock entry",
              variant: "accent",
              icon: Plus,
              onClick: onAddStock,
            }}
          />
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
