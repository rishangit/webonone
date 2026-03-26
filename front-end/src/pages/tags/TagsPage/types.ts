import { Tag } from "@/services/tags";
import { UserRole } from "@/types/user";

export interface TagsPageProps {
  currentUser?: {
    email: string;
    role: string | number | UserRole;
    name: string;
  } | null;
}

export interface TagCardProps {
  tag: Tag;
  viewMode: "grid" | "list";
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
  onToggleStatus: (tag: Tag) => void;
}

export interface TagViewProps {
  tag: Tag;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
  onToggleStatus: (tag: Tag) => void;
}

export interface TagIconProps {
  tag: Tag;
  variant?: "grid" | "list";
}

export interface TagStatusProps {
  isActive: boolean;
}

export interface TagActionsProps {
  tag: Tag;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
  onToggleStatus: (tag: Tag) => void;
}

export interface TagInfoProps {
  tag: Tag;
  variant?: "grid" | "list";
}

export interface TagsStatsProps {
  total: number;
  active: number;
  inactive: number;
  usage: number;
}

export interface TagsFiltersProps {
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onDebouncedSearchTermChange: (term: string) => void;
  onClearFilters: () => void;
  resultsCount: number;
  debouncedSearchTerm: string;
}

export interface TagDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: Tag | null;
  onDelete: () => void;
  loading?: boolean;
}
