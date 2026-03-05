import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { fetchUsersRequest } from "../../../../store/slices/usersSlice";
import { authService } from "../../../../services/auth";
import { usersService } from "../../../../services/users";
import { isRole, UserRole, User, UserRoleNames } from "../../../../types/user";
import { UsersPageProps } from "../types";

export const useUsersPage = ({
  currentUser,
  onViewProfile,
  onViewAppointments,
}: UsersPageProps) => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const {
    users: allUsers,
    loading: usersLoading,
    error: usersError,
    stats: usersStats,
    pagination
  } = useAppSelector((state) => state.users);

  // All state declarations
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [pendingImpersonationUser, setPendingImpersonationUser] = useState<any>(null);
  const [pendingRoles, setPendingRoles] = useState<any[]>([]);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isAddCompanyUserDialogOpen, setIsAddCompanyUserDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [selectedCompanyUserId, setSelectedCompanyUserId] = useState<string | null>(null);
  const [allUsersForSelection, setAllUsersForSelection] = useState<User[]>([]);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Get company ID from user
  const companyId = user?.companyId || (currentUser as any)?.companyId;

  // Listen for header search event and sessionStorage
  useEffect(() => {
    const handleHeaderSearch = (event: CustomEvent) => {
      const { query, entity } = event.detail;
      if (entity === "user") {
        setSearchTerm(query);
        setDebouncedSearchTerm(query);
        setCurrentPage(1);
        sessionStorage.removeItem(`searchQuery_user`);
      }
    };

    // Check sessionStorage on mount
    const storedQuery = sessionStorage.getItem("searchQuery_user");
    if (storedQuery) {
      setSearchTerm(storedQuery);
      setDebouncedSearchTerm(storedQuery);
      setCurrentPage(1);
      sessionStorage.removeItem("searchQuery_user");
    }

    window.addEventListener("headerSearch", handleHeaderSearch as EventListener);
    return () => {
      window.removeEventListener("headerSearch", handleHeaderSearch as EventListener);
    };
  }, [setSearchTerm, setDebouncedSearchTerm, setCurrentPage]);

  // Check if current user is system admin
  const getCurrentUserRole = () => {
    if (user?.role !== undefined && user?.role !== null) {
      return user.role;
    }
    if ((currentUser as any)?.role !== undefined && (currentUser as any)?.role !== null) {
      return (currentUser as any).role;
    }
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.role !== undefined && parsedUser?.role !== null) {
          return parsedUser.role;
        }
      }
    } catch (e) {
      // Error parsing stored user - silently fail
    }
    return undefined;
  };

  const currentUserRole = getCurrentUserRole();
  const isSystemAdmin = isRole(currentUserRole, UserRole.SYSTEM_ADMIN);
  const isCompanyOwner = isRole(currentUserRole, UserRole.COMPANY_OWNER);

  // Clear filters handler
  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSelectedStatus("all");
    setSelectedRole("all");
    setCurrentPage(1);
  };

  // Fetch users with pagination and filters
  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    const filters: any = {
      limit: itemsPerPage,
      offset,
      page: currentPage,
    };

    if (isSystemAdmin) {
      // System admin - no companyId filter
    } else {
      // Company owners - add companyId filter
      if (!companyId) {
        return;
      }
      filters.companyId = companyId;
    }

    // Add search
    if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
      filters.search = debouncedSearchTerm.trim();
    }

    // Add status filter
    if (selectedStatus === "active") {
      filters.isActive = true;
    } else if (selectedStatus === "inactive") {
      filters.isActive = false;
    }

    // Add role filter (convert role name to role number)
    if (selectedRole !== "all") {
      const roleEntry = Object.entries(UserRoleNames).find(([_, name]) => name === selectedRole);
      if (roleEntry) {
        filters.role = parseInt(roleEntry[0]);
      }
    }

    dispatch(fetchUsersRequest(filters));
  }, [dispatch, isSystemAdmin, companyId, currentPage, itemsPerPage, debouncedSearchTerm, selectedStatus, selectedRole]);

  // Reset to page 1 when filters change (but not when pagination changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedStatus, selectedRole]);

  // Handle errors
  useEffect(() => {
    if (usersError && isSystemAdmin) {
      toast.error(`Failed to fetch users: ${usersError}`);
    }
  }, [usersError, isSystemAdmin]);

  // Transform users based on source
  const users = useMemo(() => {
    return allUsers.map((user: User) => {
      // Get all roles from users_role table (excluding USER role for display)
      const roles = user.roles || [];
      const nonUserRoles = roles.filter(r => r.role !== UserRole.USER);
      // If no special roles, default to showing User
      const displayRoles = nonUserRoles.length > 0 ? nonUserRoles : roles;
      const roleNames = displayRoles.map(r => UserRoleNames[r.role] || "User");
      const primaryRoleName = roleNames[0] || UserRoleNames[user.role] || "User";

      return {
        id: user.id,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "N/A",
        avatar: user.avatar,
        role: primaryRoleName,
        roles: displayRoles,
        roleNames: roleNames,
        specialty: primaryRoleName,
        location: user.address || "N/A",
        lastVisit: user.lastLogin || user.updatedAt || "N/A",
        nextAppointment: "N/A",
        totalVisits: 0,
        memberSince: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: user.isActive ? "Active" as const : "Inactive" as const,
        tags: roleNames,
        joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        appointmentsCount: 0,
        notes: "",
        createdAt: user.createdAt
      };
    });
  }, [allUsers]);

  // Both system admin and company owners: use users from Redux
  const displayedUsers = useMemo(() => {
    return users;
  }, [users]);

  // Memoize stats calculation
  const pageStats = useMemo(() => {
    const totalUsers = isSystemAdmin && pagination
      ? pagination.total
      : (isSystemAdmin ? allUsers.length : users.length);

    let totalCompanyOwners = 0;
    let totalStaffMembers = 0;

    if (isSystemAdmin && usersStats?.usersByRole) {
      totalCompanyOwners = usersStats.usersByRole[String(UserRole.COMPANY_OWNER)] ||
        usersStats.usersByRole['1'] || 0;

      totalStaffMembers = usersStats.usersByRole[String(UserRole.STAFF_MEMBER)] ||
        usersStats.usersByRole['2'] || 0;
    } else if (isSystemAdmin && allUsers.length > 0) {
      totalCompanyOwners = allUsers.filter((user: User) => {
        const roleValue = user.role as number;
        return roleValue === UserRole.COMPANY_OWNER;
      }).length;

      totalStaffMembers = allUsers.filter((user: User) => {
        const roleValue = user.role as number;
        return roleValue === UserRole.STAFF_MEMBER;
      }).length;
    } else if (!isSystemAdmin) {
      totalCompanyOwners = users.filter(u => {
        const roleNames = u.roleNames || [];
        return roleNames.includes(UserRoleNames[UserRole.COMPANY_OWNER]) ||
          roleNames.includes('Company Owner');
      }).length;

      totalStaffMembers = users.filter(u => {
        const roleNames = u.roleNames || [];
        return roleNames.includes(UserRoleNames[UserRole.STAFF_MEMBER]) ||
          roleNames.includes('Staff Member');
      }).length;
    }

    const sourceUsers = isSystemAdmin ? allUsers : users;
    const activeUsers = sourceUsers.filter((u: any) => {
      if (isSystemAdmin) {
        return (u as User).isActive;
      }
      return u.status === "Active";
    }).length;

    return {
      totalUsers,
      activeUsers,
      totalCompanyOwners,
      totalStaffMembers
    };
  }, [isSystemAdmin, pagination, allUsers, users, usersStats]);

  // Memoized unique statuses
  const uniqueStatuses = useMemo(() => {
    const statusSet = new Set<string>();
    users.forEach(user => {
      if (user.status) statusSet.add(user.status);
    });
    return Array.from(statusSet).sort();
  }, [users]);

  // Memoized unique roles
  const uniqueRoles = useMemo(() => {
    if (!isSystemAdmin) {
      return [];
    }

    const roleSet = new Set<string>();
    users.forEach(user => {
      const userAny = user as any;
      if (userAny.roles && Array.isArray(userAny.roles) && userAny.roles.length > 0) {
        userAny.roles.forEach((r: any) => {
          const roleNum = r.role as UserRole;
          const roleName = UserRoleNames[roleNum] || String(r.role);
          if (roleName) roleSet.add(roleName);
        });
      } else if (userAny.roleNames && Array.isArray(userAny.roleNames)) {
        userAny.roleNames.forEach((roleName: string) => {
          if (roleName) roleSet.add(roleName);
        });
      } else if (user.role) {
        const userRole = user.role as string | UserRole;
        const roleName = typeof userRole === 'string' ? userRole : UserRoleNames[userRole as UserRole];
        if (roleName) roleSet.add(roleName);
      }
    });
    return Array.from(roleSet).sort();
  }, [isSystemAdmin, users]);

  // Page title and description
  const pageTitle = isSystemAdmin ? "All Users" : "Company Clients";
  const pageDescription = isSystemAdmin
    ? "View and manage all users in the system"
    : "View all clients who have made appointments with your company";

  // Handle impersonation
  const handleImpersonate = async (userId: string) => {
    if (!token) {
      toast.error("Authentication token is missing");
      return;
    }

    try {
      const response = await authService.impersonateUser(token, userId);

      // Check if role selection is required
      if ('requiresRoleSelection' in response && response.requiresRoleSelection) {
        setPendingImpersonationUser(response.user);
        setPendingRoles(response.roles);
        setPendingUserId(userId);
        setShowRoleSelection(true);
        return;
      }

      // Single role - proceed directly
      const impersonationResponse = response as any;

      if (impersonationResponse.originalAdmin) {
        localStorage.setItem('originalAdmin', JSON.stringify(impersonationResponse.originalAdmin));
      }

      localStorage.setItem('authToken', impersonationResponse.token);
      localStorage.setItem('user', JSON.stringify(impersonationResponse.user));
      localStorage.setItem('isImpersonating', 'true');

      toast.success(`Now logged in as ${impersonationResponse.user.name || impersonationResponse.user.email}`);

      window.location.href = '/system/dashboard';
    } catch (error: any) {
      toast.error(error.message || 'Failed to impersonate user');
    }
  };

  // Handle role selection for impersonation
  const handleRoleSelection = async (roleId: string | null) => {
    if (!token || !pendingUserId) {
      toast.error("Missing required information for impersonation");
      return;
    }

    try {
      const response = await authService.completeImpersonateWithRole(token, pendingUserId, roleId);

      if (response.originalAdmin) {
        localStorage.setItem('originalAdmin', JSON.stringify(response.originalAdmin));
      }

      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('isImpersonating', 'true');

      setShowRoleSelection(false);
      setPendingImpersonationUser(null);
      setPendingRoles([]);
      setPendingUserId(null);

      toast.success(`Now logged in as ${response.user.name || response.user.email}`);

      window.location.href = '/system/dashboard';
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete impersonation');
    }
  };

  // Handle role selection cancel
  const handleRoleSelectionCancel = () => {
    setShowRoleSelection(false);
    setPendingImpersonationUser(null);
    setPendingRoles([]);
    setPendingUserId(null);
  };

  // Fetch all users when dialog opens
  useEffect(() => {
    if (isAddCompanyUserDialogOpen && isCompanyOwner && companyId) {
      const fetchAllUsers = async () => {
        setLoadingAllUsers(true);
        try {
          const response = await usersService.getAllUsers({
            limit: 1000,
            offset: 0,
            page: 1,
            isActive: true,
          });
          setAllUsersForSelection(response.users);
        } catch (error: any) {
          console.error("Error fetching all users for selection:", error);
          toast.error("Failed to load users. Please try again.");
          setAllUsersForSelection([]);
        } finally {
          setLoadingAllUsers(false);
        }
      };
      fetchAllUsers();
    } else if (!isAddCompanyUserDialogOpen) {
      setSelectedCompanyUserId(null);
    }
  }, [isAddCompanyUserDialogOpen, isCompanyOwner, companyId]);

  // Refresh users after create/add
  const refreshUsers = () => {
    const offset = (currentPage - 1) * itemsPerPage;
    const filters: any = {
      limit: itemsPerPage,
      offset,
      page: currentPage,
    };

    if (!isSystemAdmin && companyId) {
      filters.companyId = companyId;
    }

    if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
      filters.search = debouncedSearchTerm.trim();
    }

    if (selectedStatus === "active") {
      filters.isActive = true;
    } else if (selectedStatus === "inactive") {
      filters.isActive = false;
    }

    if (selectedRole !== "all") {
      const roleEntry = Object.entries(UserRoleNames).find(([_, name]) => name === selectedRole);
      if (roleEntry) {
        filters.role = parseInt(roleEntry[0]);
      }
    }

    dispatch(fetchUsersRequest(filters));
  };

  return {
    // State
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    setDebouncedSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    selectedStatus,
    setSelectedStatus,
    selectedRole,
    setSelectedRole,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    isAddCompanyUserDialogOpen,
    setIsAddCompanyUserDialogOpen,
    isCreateUserDialogOpen,
    setIsCreateUserDialogOpen,
    selectedCompanyUserId,
    setSelectedCompanyUserId,
    showRoleSelection,
    pendingImpersonationUser,
    pendingRoles,
    pendingUserId,
    allUsersForSelection,
    loadingAllUsers,
    // Data
    displayedUsers,
    loading: usersLoading,
    error: usersError,
    pagination,
    pageStats,
    uniqueStatuses,
    uniqueRoles,
    companyId,
    isSystemAdmin,
    isCompanyOwner,
    pageTitle,
    pageDescription,
    // Handlers
    handleClearFilters,
    handleImpersonate,
    handleRoleSelection,
    handleRoleSelectionCancel,
    refreshUsers,
    dispatch,
    currentUser,
    onViewProfile,
    onViewAppointments,
  };
};
