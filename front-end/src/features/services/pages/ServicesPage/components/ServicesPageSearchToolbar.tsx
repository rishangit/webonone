import { ServiceCatalogSearchCard } from "@/features/services/components";

export interface ServicesPageSearchToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onDebouncedSearchChange: (value: string) => void;
  debouncedSearchTerm: string;
  filterCategory: string;
  filterStatus: string;
  onOpenFilters: () => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function ServicesPageSearchToolbar({
  searchTerm,
  onSearchChange,
  onDebouncedSearchChange,
  debouncedSearchTerm,
  filterCategory,
  filterStatus,
  onOpenFilters,
  viewMode,
  onViewModeChange,
}: ServicesPageSearchToolbarProps) {
  const filterActive = Boolean(debouncedSearchTerm || filterCategory !== "all" || filterStatus !== "all");

  return (
    <ServiceCatalogSearchCard
      searchPlaceholder="Search services by name, category, or description..."
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      onDebouncedSearchChange={onDebouncedSearchChange}
      filterActive={filterActive}
      onFilterClick={onOpenFilters}
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
    />
  );
}
