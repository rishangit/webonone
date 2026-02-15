import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { RightPanel } from "../../../components/common/RightPanel";
import { TagSelector } from "../../../components/tags/TagSelector";

interface SystemProductFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statusFilter: string;
  verifiedFilter: string;
  selectedTagIds: string[];
  onStatusFilterChange: (value: string) => void;
  onVerifiedFilterChange: (value: string) => void;
  onTagIdsChange: (tagIds: string[]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  resultsCount: number;
}

export const SystemProductFilters = ({
  open,
  onOpenChange,
  statusFilter,
  verifiedFilter,
  selectedTagIds,
  onStatusFilterChange,
  onVerifiedFilterChange,
  onTagIdsChange,
  onClearFilters,
  hasActiveFilters,
  resultsCount,
}: SystemProductFiltersProps) => {
  return (
    <RightPanel
      open={open}
      onOpenChange={onOpenChange}
      title="Filters"
      contentClassName="bg-background"
    >
      <div className="space-y-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Status</label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Verified Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Verified</label>
          <Select value={verifiedFilter} onValueChange={onVerifiedFilterChange}>
            <SelectTrigger className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Verified</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tags</label>
          <TagSelector
            value={selectedTagIds}
            onChange={onTagIdsChange}
            placeholder="Select tags"
          />
        </div>

        {/* Filter Results Count */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Results</span>
              <Badge variant="outline" className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                {resultsCount} products
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
