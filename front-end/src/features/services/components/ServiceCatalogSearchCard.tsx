import type { ReactNode } from "react";
import { Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/common/SearchInput";
import { ViewSwitcher } from "@/components/ui/view-switcher";
import { cn } from "@/components/ui/utils";

export interface ServiceCatalogSearchCardProps {
  searchPlaceholder: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onDebouncedSearchChange: (value: string) => void;
  debounceDelay?: number;
  filterActive: boolean;
  onFilterClick: () => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  /** Optional filter controls shown below the toolbar row */
  children?: ReactNode;
}

export function ServiceCatalogSearchCard({
  searchPlaceholder,
  searchTerm,
  onSearchChange,
  onDebouncedSearchChange,
  debounceDelay = 500,
  filterActive,
  onFilterClick,
  viewMode,
  onViewModeChange,
  children,
}: ServiceCatalogSearchCardProps) {
  return (
    <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] mb-6">
      <div className="space-y-4">
        <SearchInput
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={onSearchChange}
          onDebouncedChange={onDebouncedSearchChange}
          debounceDelay={debounceDelay}
        />
        <div className="flex items-center justify-end gap-3 flex-wrap">
          <Button
            variant="outline"
            type="button"
            onClick={onFilterClick}
            className={cn(
              "h-9",
              filterActive
                ? "bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent-text)] hover:bg-[var(--accent-primary)] hover:border-[var(--accent-primary)]"
                : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
            )}
          >
            <Filter className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <ViewSwitcher viewMode={viewMode} onViewModeChange={onViewModeChange} />
        </div>
        {children}
      </div>
    </Card>
  );
}
