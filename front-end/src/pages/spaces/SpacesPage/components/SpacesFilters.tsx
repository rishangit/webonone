import { Filter } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Badge } from "../../../../components/ui/badge";
import { SearchInput } from "../../../../components/common/SearchInput";
import { ViewSwitcher } from "../../../../components/ui/view-switcher";
import { RightPanel } from "../../../../components/common/RightPanel";
import { cn } from "../../../../components/ui/utils";
import { SpacesFiltersProps } from "../types";

export const SpacesFilters = ({
  filterStatus,
  onFilterStatusChange,
  searchTerm,
  onSearchTermChange,
  onDebouncedSearchTermChange,
  onClearFilters,
  resultsCount,
  viewMode,
  onViewModeChange,
  isFilterPanelOpen,
  onFilterPanelOpenChange,
  debouncedSearchTerm
}: SpacesFiltersProps & { viewMode: "grid" | "list"; onViewModeChange: (mode: "grid" | "list") => void; isFilterPanelOpen: boolean; onFilterPanelOpenChange: (open: boolean) => void; debouncedSearchTerm: string }) => {
  const hasActiveFilters = debouncedSearchTerm || filterStatus !== "all";

  return (
    <>
      <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] mb-6">
        <div className="space-y-4">
          <SearchInput
            placeholder="Search spaces by name or description..."
            value={searchTerm}
            onChange={onSearchTermChange}
            onDebouncedChange={onDebouncedSearchTermChange}
            debounceDelay={500}
          />
          
          <div className="flex items-center justify-end gap-3 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => onFilterPanelOpenChange(true)}
              className={cn(
                "h-9",
                hasActiveFilters
                  ? "bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent-text)] hover:bg-[var(--accent-primary)] hover:border-[var(--accent-primary)]"
                  : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
              )}
            >
              <Filter className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>

            <ViewSwitcher
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
            />
          </div>
        </div>
      </Card>

      <RightPanel
        open={isFilterPanelOpen}
        onOpenChange={onFilterPanelOpenChange}
        title="Filters"
        contentClassName="bg-background"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <Select value={filterStatus} onValueChange={onFilterStatusChange}>
              <SelectTrigger className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Results</span>
                <Badge variant="outline" className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                  {resultsCount} spaces
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
    </>
  );
};
