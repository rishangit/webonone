import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/common/SearchInput";
import { ViewSwitcher } from "@/components/ui/view-switcher";

export interface ProductAttributesSearchCardProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export const ProductAttributesSearchCard = ({
  searchTerm,
  onSearchTermChange,
  viewMode,
  onViewModeChange,
}: ProductAttributesSearchCardProps) => (
  <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
    <div className="space-y-4">
      <SearchInput placeholder="Search attributes..." value={searchTerm} onChange={onSearchTermChange} />
      <div className="flex items-center justify-end gap-3 flex-wrap">
        <ViewSwitcher viewMode={viewMode} onViewModeChange={onViewModeChange} />
      </div>
    </div>
  </Card>
);
