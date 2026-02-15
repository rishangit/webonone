import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { RightPanel } from "../../../components/common/RightPanel";

interface ProductAttributeFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statusFilter: string;
  valueDataTypeFilter: string;
  onStatusFilterChange: (value: string) => void;
  onValueDataTypeFilterChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  resultsCount: number;
}

export const ProductAttributeFilters = ({
  open,
  onOpenChange,
  statusFilter,
  valueDataTypeFilter,
  onStatusFilterChange,
  onValueDataTypeFilterChange,
  onClearFilters,
  hasActiveFilters,
  resultsCount,
}: ProductAttributeFiltersProps) => {
  return (
    <RightPanel
      open={open}
      onOpenChange={onOpenChange}
      title="Filters"
      contentClassName="bg-background"
    >
      <div className="space-y-4">
        {/* Value Data Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Data Type</label>
          <Select value={valueDataTypeFilter} onValueChange={onValueDataTypeFilterChange}>
            <SelectTrigger className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
              <SelectValue placeholder="All Data Types" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Data Types</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Status</label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Results Count */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Results</span>
              <Badge variant="outline" className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                {resultsCount} attributes
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-accent hover:text-foreground"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </RightPanel>
  );
};
