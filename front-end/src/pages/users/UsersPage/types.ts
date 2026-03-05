import { User } from "../../../types/user";

export interface UsersPageProps {
  currentUser?: {
    email: string;
    role: string;
    name: string;
    companyId?: string;
  } | null;
  onViewProfile?: (userId: string) => void;
  onViewAppointments?: (userId: string) => void;
}

export interface UsersStatsProps {
  totalUsers: number;
  activeUsers: number;
  totalCompanyOwners: number;
  totalStaffMembers: number;
}

export interface UsersFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onDebouncedSearchTermChange: (term: string) => void;
  selectedStatus: string;
  onSelectedStatusChange: (status: string) => void;
  selectedRole: string;
  onSelectedRoleChange: (role: string) => void;
  uniqueStatuses: string[];
  uniqueRoles: string[];
  debouncedSearchTerm: string;
  resultsCount: number;
  onClearFilters: () => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  isFilterPanelOpen: boolean;
  onFilterPanelOpenChange: (open: boolean) => void;
  isSystemAdmin: boolean;
}

export interface UsersListProps {
  users: any[];
  viewMode: "grid" | "list";
  currentUser?: any;
  onViewProfile?: (userId: string) => void;
  onViewAppointments?: (userId: string) => void;
  onImpersonate?: (userId: string) => void;
  isSystemAdmin: boolean;
}

export interface LoadingSkeletonProps {
  viewMode: "grid" | "list";
}
