import { Space } from "../../../services/spaces";

export interface SpaceCardProps {
  space: Space & { appointments?: { today: number; thisWeek: number } };
  viewMode: "grid" | "list";
  onView: (space: Space) => void;
  onEdit: (space: Space) => void;
  onDelete: (space: Space) => void;
}

export interface SpaceViewProps {
  space: Space & { appointments?: { today: number; thisWeek: number } };
  onView: (space: Space) => void;
  onEdit: (space: Space) => void;
  onDelete: (space: Space) => void;
}

export interface SpaceImageProps {
  imageUrl?: string;
  spaceName: string;
  variant?: "grid" | "list";
}

export interface SpaceStatusProps {
  status: Space["status"];
  variant?: "grid" | "list";
}

export interface SpaceActionsProps {
  space: Space;
  onView: (space: Space) => void;
  onEdit: (space: Space) => void;
  onDelete: (space: Space) => void;
}

export interface SpaceInfoProps {
  space: Space & { appointments?: { today: number; thisWeek: number } };
  variant?: "grid" | "list";
}

export interface SpacesStatsProps {
  totalSpaces: number;
  activeSpaces: number;
  todayBookings: number;
}

export interface SpacesFiltersProps {
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onDebouncedSearchTermChange: (term: string) => void;
  onClearFilters: () => void;
  resultsCount: number;
}

export interface SpaceFormData {
  name: string;
  capacity: string;
  status: Space["status"];
  description: string;
  imageUrl: string;
  tagIds: string[];
}

export interface SpaceAddEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  formData: SpaceFormData;
  onFormDataChange: (data: Partial<SpaceFormData>) => void;
  onSave: () => void;
  companyId?: string;
  onImageUploaded: (filePath: string, fileUrl: string) => void;
  onImageDeleted: () => void;
}

export interface SpaceViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space: Space | null;
}

export interface SpaceDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space: Space | null;
  onDelete: () => void;
}
