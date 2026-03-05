import { Staff } from "../../../services/staff";

export interface StaffCardProps {
  member: Staff;
  viewMode: "grid" | "list";
  onView: (member: Staff) => void;
  onDelete: (member: Staff) => void;
}

export interface StaffViewProps {
  member: Staff;
  onView: (member: Staff) => void;
  onDelete: (member: Staff) => void;
}

export interface StaffAvatarProps {
  member: Staff;
  variant?: "grid" | "list";
}

export interface StaffStatusProps {
  status: Staff["status"];
}

export interface StaffRoleProps {
  role?: string;
}

export interface StaffActionsProps {
  member: Staff;
  onView: (member: Staff) => void;
  onDelete: (member: Staff) => void;
}

export interface StaffInfoProps {
  member: Staff;
  variant?: "grid" | "list";
}

export interface StaffFiltersProps {
  filterRole: string;
  onFilterRoleChange: (role: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  filterDepartment: string;
  onFilterDepartmentChange: (department: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onDebouncedSearchTermChange: (term: string) => void;
  onClearFilters: () => void;
  resultsCount: number;
  uniqueRoles: string[];
  uniqueDepartments: string[];
  debouncedSearchTerm: string;
}

export interface StaffDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Staff | null;
  onDelete: () => void;
}

export interface StaffPageProps {
  currentUser?: {
    email: string;
    role: string;
    name: string;
    companyId?: string;
  } | null;
}
