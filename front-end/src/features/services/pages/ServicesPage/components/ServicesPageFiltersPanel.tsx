import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RightPanel } from "@/components/common/RightPanel";
import type { Service } from "@/features/services/services";

export interface ServicesPageFiltersPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: Service[];
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  debouncedSearchTerm: string;
  filteredCount: number;
  onClearFilters: () => void;
}

export function ServicesPageFiltersPanel({
  open,
  onOpenChange,
  services,
  filterCategory,
  onFilterCategoryChange,
  filterStatus,
  onFilterStatusChange,
  debouncedSearchTerm,
  filteredCount,
  onClearFilters,
}: ServicesPageFiltersPanelProps) {
  const categories = [...new Set(services.map((s) => s.category).filter((cat): cat is string => Boolean(cat)))];
  const hasActiveFilters = Boolean(debouncedSearchTerm || filterCategory !== "all" || filterStatus !== "all");

  return (
    <RightPanel open={open} onOpenChange={onOpenChange} title="Filters" contentClassName="bg-background">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="service-filter-category" className="text-sm font-medium text-foreground">
            Category
          </Label>
          <Select value={filterCategory} onValueChange={onFilterCategoryChange}>
            <SelectTrigger id="service-filter-category" className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-filter-status" className="text-sm font-medium text-foreground">
            Status
          </Label>
          <Select value={filterStatus} onValueChange={onFilterStatusChange}>
            <SelectTrigger id="service-filter-status" className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Results</span>
              <Badge variant="outline" className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                {filteredCount} services
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
}
