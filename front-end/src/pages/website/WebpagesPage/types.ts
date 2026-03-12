import { CompanyWebPage } from "@/services/companyWebPages";

export interface WebpageCardProps {
  webPage: CompanyWebPage;
  viewMode: "grid" | "list";
  onEdit: (webPage: CompanyWebPage) => void;
  onBrowse: (webPage: CompanyWebPage) => void;
  onDelete: (webPage: CompanyWebPage) => void;
}

export interface WebpageViewProps {
  webPage: CompanyWebPage;
  onEdit: (webPage: CompanyWebPage) => void;
  onBrowse: (webPage: CompanyWebPage) => void;
  onDelete: (webPage: CompanyWebPage) => void;
}

export interface WebpageActionsProps {
  webPage: CompanyWebPage;
  onEdit: (webPage: CompanyWebPage) => void;
  onBrowse: (webPage: CompanyWebPage) => void;
  onDelete: (webPage: CompanyWebPage) => void;
}

export interface WebpagesFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onDebouncedSearchTermChange: (term: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  onClearFilters: () => void;
  resultsCount: number;
  debouncedSearchTerm: string;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  isFilterPanelOpen: boolean;
  onFilterPanelOpenChange: (open: boolean) => void;
}

export interface WebpageDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webPage: CompanyWebPage | null;
  onDelete: () => void;
}
