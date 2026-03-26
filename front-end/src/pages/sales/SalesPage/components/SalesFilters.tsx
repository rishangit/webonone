import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RightPanel } from "@/components/common/RightPanel";
import { SalesFiltersProps } from "../types";

export const SalesFilters = ({
  open,
  onOpenChange,
  dateRange,
  onDateRangeChange,
  filterType,
  onFilterTypeChange,
  filterStatus,
  onFilterStatusChange,
  activeTab,
  hasActiveFilters,
  resultsCount,
  onClearFilters,
}: SalesFiltersProps) => {
  return (
    <RightPanel
      open={open}
      onOpenChange={onOpenChange}
      title="Filters"
      contentClassName="bg-background"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Date Range</label>
          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {activeTab === "sales" && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Type</label>
              <Select value={filterType} onValueChange={onFilterTypeChange}>
                <SelectTrigger className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="appointment">Appointment Sales</SelectItem>
                  <SelectItem value="product">Direct Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Select value={filterStatus} onValueChange={onFilterStatusChange}>
                <SelectTrigger className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {hasActiveFilters && (
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Results</span>
              <Badge variant="outline" className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                {resultsCount} sales
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
