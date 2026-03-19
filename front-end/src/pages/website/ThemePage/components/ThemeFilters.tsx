import { Card } from "../../../../components/ui/card";
import { SearchInput } from "../../../../components/common/SearchInput";
import { ViewSwitcher } from "../../../../components/ui/view-switcher";

export interface ThemeFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onDebouncedSearchTermChange: (term: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export const ThemeFilters = ({
  searchTerm,
  onSearchTermChange,
  onDebouncedSearchTermChange,
  viewMode,
  onViewModeChange,
}: ThemeFiltersProps) => {
  return (
    <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] mb-6">
      <div className="space-y-4">
        <SearchInput
          placeholder="Search themes by name..."
          value={searchTerm}
          onChange={onSearchTermChange}
          onDebouncedChange={onDebouncedSearchTermChange}
          debounceDelay={500}
        />
        <div className="flex items-center justify-end gap-3 flex-wrap">
          <ViewSwitcher viewMode={viewMode} onViewModeChange={onViewModeChange} />
        </div>
      </div>
    </Card>
  );
};
