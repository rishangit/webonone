import { Users, TrendingUp, Building2, Briefcase, UserPlus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { UserCard } from "./UserCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useState, useEffect, useMemo, memo } from "react";
import { ViewSwitcher } from "../../components/ui/view-switcher";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { authService } from "../../services/auth";
import { toast } from "sonner";
import { isRole, UserRole, User, UserRoleNames } from "../../types/user";
import { fetchUsersRequest } from "../../store/slices/usersSlice";
import { SearchInput } from "../../components/common/SearchInput";
import { Pagination } from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";
// Note: We don't update Redux state during impersonation to avoid double render
// The page reload will restore user from localStorage and trigger refreshUserRequest in App initialization
import { RoleSelectionDialog } from "../../components/auth/RoleSelectionDialog";
import { UserSelectionDialog } from "../../components/common/UserSelectionDialog";
import { CreateUserDialog } from "./CreateUserDialog";
import { usersService } from "../../services/users";

// Mock data removed - now using Redux to fetch from API

interface UsersPageProps {
  currentUser?: {
    email: string;
    role: string;
    name: string;
  } | null;
  onViewProfile?: (userId: string) => void;
  onViewAppointments?: (userId: string) => void;
}

export function UsersPage({ currentUser, onViewProfile, onViewAppointments }: UsersPageProps) {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const { 
    users: allUsers, 
    loading: usersLoading, 
    error: usersError, 
    stats: usersStats,
    pagination 
  } = useAppSelector((state) => state.users);
  
  // All state declarations at the top (like ProductsPage)
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

  // Get company ID from user (like ProductsPage)
  const companyId = user?.companyId || (currentUser as any)?.companyId;
  
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

  // Fetch users with pagination and filters (like ProductsPage)
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

  // Transform users based on source (both system admin and company owners use Redux now)
  // Use useMemo to prevent unnecessary recalculations when Redux state updates
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
        role: primaryRoleName, // Keep for backward compatibility
        roles: displayRoles, // All roles for display
        roleNames: roleNames, // All role names for display
        specialty: primaryRoleName,
        location: user.address || "N/A",
        lastVisit: user.lastLogin || user.updatedAt || "N/A",
        nextAppointment: "N/A",
        totalVisits: 0, // Calculate from appointments if needed
        memberSince: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: user.isActive ? "Active" as const : "Inactive" as const,
        tags: roleNames,
        joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        appointmentsCount: 0, // Calculate from appointments if needed
        notes: "",
        createdAt: user.createdAt
      };
    });
  }, [allUsers]);

  // Both system admin and company owners: use users from Redux (already paginated and filtered by API)
  // Memoize to prevent recalculation on every render (like ProductsPage filteredProducts)
  const displayedUsers = useMemo(() => {
    return users;
  }, [users]);

  // Memoize stats calculation to prevent recalculation on every render
  // This is critical to prevent SearchInput from losing focus when API results load
  const pageStats = useMemo(() => {
    // For system admin, use pagination total for accurate counts
    // For others, use the transformed users array
    const totalUsers = isSystemAdmin && pagination 
      ? pagination.total 
      : (isSystemAdmin ? allUsers.length : users.length);
    
    // Get company owners and staff members from users_role table stats (if available)
    let totalCompanyOwners = 0;
    let totalStaffMembers = 0;
    
    if (isSystemAdmin && usersStats?.usersByRole) {
      // Use stats from users_role table (most accurate)
      // The backend returns keys as lowercase string numbers like "1", "2", etc.
      // Backend code: String(row.role).toLowerCase() creates keys like "1", "2"
      totalCompanyOwners = usersStats.usersByRole[String(UserRole.COMPANY_OWNER)] || 
                          usersStats.usersByRole['1'] || 0;
      
      totalStaffMembers = usersStats.usersByRole[String(UserRole.STAFF_MEMBER)] || 
                         usersStats.usersByRole['2'] || 0;
    } else if (isSystemAdmin && allUsers.length > 0) {
      // Fallback: Count from allUsers if stats not available
      totalCompanyOwners = allUsers.filter((user: User) => {
        const roleValue = user.role as number;
        return roleValue === UserRole.COMPANY_OWNER;
      }).length;
      
      totalStaffMembers = allUsers.filter((user: User) => {
        const roleValue = user.role as number;
        return roleValue === UserRole.STAFF_MEMBER;
      }).length;
    } else if (!isSystemAdmin) {
      // For non-system admin, count from transformed users array
      // Check role names from the roles array
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
    
    // For active users, count from current page data (limited accuracy)
    // Ideally this would come from a separate stats endpoint
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

  // Memoized unique statuses (simplified like ProductsPage)
  const uniqueStatuses = useMemo(() => {
    const statusSet = new Set<string>();
    users.forEach(user => {
      if (user.status) statusSet.add(user.status);
    });
    return Array.from(statusSet).sort();
  }, [users]);

  // Memoized unique roles (simplified like ProductsPage)
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

  // Page title and description - simple values, no memoization needed
  const pageTitle = isSystemAdmin ? "All Users" : "Company Clients";
  const pageDescription = isSystemAdmin 
    ? "View and manage all users in the system"
    : "View all clients who have made appointments with your company";

// Memoized Users List component - only this should re-render when data changes
// Moved outside main component to prevent recreation on every render
const UsersList = memo(({ 
  users, 
  viewMode, 
  currentUser, 
  onViewProfile, 
  onViewAppointments, 
  onImpersonate, 
  isSystemAdmin 
}: {
  users: any[];
  viewMode: "grid" | "list";
  currentUser?: any;
  onViewProfile?: (userId: string) => void;
  onViewAppointments?: (userId: string) => void;
  onImpersonate?: (userId: string) => void;
  isSystemAdmin: boolean;
}) => {
  return (
    <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
      {users.map((user) => (
        <UserCard 
          key={user.id}
          id={user.id}
          name={user.name}
          email={user.email}
          phone={user.phone}
          avatar={user.avatar}
          role={user.role}
          status={user.status.toLowerCase() as 'active' | 'inactive' | 'pending'}
          location={user.location}
          currentUser={currentUser}
          viewMode={viewMode}
          user={user}
          onViewProfile={onViewProfile}
          onViewAppointments={onViewAppointments}
          onImpersonate={onImpersonate}
          isSystemAdmin={isSystemAdmin}
        />
      ))}
    </div>
  );
});

UsersList.displayName = "UsersList";

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
        // Show role selection dialog
        setPendingImpersonationUser(response.user);
        setPendingRoles(response.roles);
        setPendingUserId(userId);
        setShowRoleSelection(true);
        return;
      }
      
      // Single role - proceed directly
      const impersonationResponse = response as any;
      
      // Store original admin info in localStorage for later reference
      if (impersonationResponse.originalAdmin) {
        localStorage.setItem('originalAdmin', JSON.stringify(impersonationResponse.originalAdmin));
      }
      
      // Save to localStorage only - don't update Redux state to avoid double render
      // The page reload will restore everything from localStorage
      localStorage.setItem('authToken', impersonationResponse.token);
      localStorage.setItem('user', JSON.stringify(impersonationResponse.user));
      localStorage.setItem('isImpersonating', 'true');
      
      toast.success(`Now logged in as ${impersonationResponse.user.name || impersonationResponse.user.email}`);
      
      // Force a full page reload immediately - this will restore user from localStorage
      // and trigger refreshUserRequest in App initialization, avoiding double render
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
      
      // Store original admin info in localStorage for later reference
      if (response.originalAdmin) {
        localStorage.setItem('originalAdmin', JSON.stringify(response.originalAdmin));
      }
      
      // Save to localStorage only - don't update Redux state to avoid double render
      // The page reload will restore everything from localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('isImpersonating', 'true');
      
      // Close role selection dialog
      setShowRoleSelection(false);
      setPendingImpersonationUser(null);
      setPendingRoles([]);
      setPendingUserId(null);
      
      toast.success(`Now logged in as ${response.user.name || response.user.email}`);
      
      // Force a full page reload immediately - this will restore user from localStorage
      // and trigger refreshUserRequest in App initialization, avoiding double render
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

  // Fetch all users when dialog opens (for company owners to select from all platform users)
  useEffect(() => {
    if (isAddCompanyUserDialogOpen && isCompanyOwner && companyId) {
      const fetchAllUsers = async () => {
        setLoadingAllUsers(true);
        try {
          // Fetch all users without company filter (like system admin does)
          // Use a high limit to get all users, or fetch in batches if needed
          const response = await usersService.getAllUsers({
            limit: 1000, // High limit to get all users
            offset: 0,
            page: 1,
            isActive: true, // Only show active users
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
      // Clear selection when dialog closes
      setSelectedCompanyUserId(null);
    }
  }, [isAddCompanyUserDialogOpen, isCompanyOwner, companyId]);


  return (
    <div className="flex flex-col min-h-full space-y-6 p-4 lg:p-6">
      <div className="flex-1 space-y-6">
      {/* Header - Simple JSX, no memoization needed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{pageTitle}</h1>
          <p className="text-muted-foreground mt-1">{pageDescription}</p>
        </div>
        {!isSystemAdmin && isCompanyOwner && companyId && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="inline-flex items-center gap-2"
              onClick={() => {
                setIsCreateUserDialogOpen(true);
              }}
            >
              <UserPlus className="w-4 h-4" />
              Create New User
            </Button>
            <Button
              variant="accent"
              size="sm"
              className="inline-flex items-center gap-2"
              onClick={() => {
                setIsAddCompanyUserDialogOpen(true);
              }}
            >
              <UserPlus className="w-4 h-4" />
              Add User to Company
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards - Simple JSX, no memoization needed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
              <Users className="w-5 h-5 text-[var(--accent-text)]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-semibold text-foreground">{pageStats.totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-semibold text-foreground">{pageStats.activeUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Company Owners</p>
              <p className="text-2xl font-semibold text-foreground">{pageStats.totalCompanyOwners}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Staff Members</p>
              <p className="text-2xl font-semibold text-foreground">{pageStats.totalStaffMembers}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters Section - Simple JSX, SearchInput handles its own memoization */}
      <div className="space-y-4">
        <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <div className="space-y-4">
            <SearchInput
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={setSearchTerm}
              onDebouncedChange={setDebouncedSearchTerm}
              debounceDelay={500}
            />

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {uniqueStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Role Filter - Only for Super Admin */}
                {isSystemAdmin && uniqueRoles.length > 0 && (
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="sm:w-40 bg-[var(--glass-bg)] border-[var(--glass-border)]">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {uniqueRoles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {(debouncedSearchTerm || selectedStatus !== "all" || (isSystemAdmin && selectedRole !== "all")) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* View Mode Toggle */}
              <ViewSwitcher 
                viewMode={viewMode} 
                onViewModeChange={setViewMode} 
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Error Message */}
        {usersError && isSystemAdmin && (
          <Card className="p-4 backdrop-blur-sm bg-red-500/10 border border-red-500/30 text-center">
            <p className="text-red-600 dark:text-red-400">
              Error loading users: {usersError}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(fetchUsersRequest({}))}
              className="mt-2"
            >
              Retry
            </Button>
          </Card>
        )}

        {/* Loading State - Skeleton for User Cards */}
        {usersLoading && displayedUsers.length === 0 ? (
          <>
            {/* Skeleton for List View */}
            {viewMode === "list" ? (
              /* Skeleton for List View - Matching UserCard structure */
              <div className="space-y-4">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                      
                      <div className="flex-1">
                        {/* Name and Status */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        </div>
                        
                        {/* Email, Phone, Location */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                            <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                        </div>
                        
                        {/* Role Badges and Member Since */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              /* Skeleton for Grid View - Matching UserCard structure */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    {/* Avatar, Name, Status, Menu */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                        <div>
                          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    </div>
                    
                    {/* Email, Phone, Location */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                        <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    </div>
                    
                    {/* Role Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                    
                    {/* Member Since */}
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : displayedUsers.length > 0 ? (
            <UsersList
              users={displayedUsers}
              viewMode={viewMode}
              currentUser={currentUser}
              onViewProfile={onViewProfile}
              onViewAppointments={onViewAppointments}
              onImpersonate={isSystemAdmin ? handleImpersonate : undefined}
              isSystemAdmin={isSystemAdmin}
            />
          ) : (
              <EmptyState
                icon={Users}
                title={isSystemAdmin ? "No users found" : "No clients found"}
                description={
                  debouncedSearchTerm || selectedStatus !== "all" || (isSystemAdmin && selectedRole !== "all")
                    ? `Try adjusting your filters to see more ${isSystemAdmin ? "users" : "clients"}`
                    : isSystemAdmin
                      ? usersError 
                        ? "Failed to load users. Please try refreshing the page."
                        : "No users found in the system."
                      : "No clients have made appointments with your company yet. Clients will appear here once they book their first appointment."
                }
              />
            )}
        </div>
      </div>

      {/* Pagination - Pushed to bottom by flex-1 above */}
      {displayedUsers.length > 0 && pagination && pagination.total > 0 && (
              <Pagination
                totalItems={pagination.total}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                showItemsPerPageSelector={true}
                itemsPerPageOptions={[12, 24, 48, 96]}
                onItemsPerPageChange={(newItemsPerPage) => {
                  setItemsPerPage(newItemsPerPage);
                  setCurrentPage(1);
                }}
              />
            )}

      {/* Create new platform user (for company owners) */}
      {isCompanyOwner && companyId && (
        <CreateUserDialog
          open={isCreateUserDialogOpen}
          onOpenChange={setIsCreateUserDialogOpen}
          companyId={companyId}
          onSuccess={() => {
            // Refresh company clients list
                    const offset = (currentPage - 1) * itemsPerPage;
            const filters: any = {
                      limit: itemsPerPage,
              offset,
                      page: currentPage,
              companyId,
            };
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
          }}
        />
      )}

      {/* Role Selection Dialog for Impersonation */}
      {showRoleSelection && pendingImpersonationUser && pendingRoles.length > 0 && (
        <RoleSelectionDialog
          open={showRoleSelection}
          user={pendingImpersonationUser}
          roles={pendingRoles}
          onRoleSelect={handleRoleSelection}
          onCancel={handleRoleSelectionCancel}
        />
      )}

      {/* Add existing platform user as company client (for company owners) */}
      {isCompanyOwner && companyId && (
        <UserSelectionDialog
          open={isAddCompanyUserDialogOpen}
          onOpenChange={setIsAddCompanyUserDialogOpen}
          value={selectedCompanyUserId}
          onChange={async (userId) => {
            if (!userId) {
              setSelectedCompanyUserId(null);
              return;
            }
            try {
              setSelectedCompanyUserId(userId);
              await usersService.addUserToCompany(String(companyId), userId);
              toast.success("User added to your company clients successfully");
              setIsAddCompanyUserDialogOpen(false);
              // Refresh company clients list with current filters
              const offset = (currentPage - 1) * itemsPerPage;
              const filters: any = {
                limit: itemsPerPage,
                offset,
                page: currentPage,
                companyId,
              };
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
            } catch (error: any) {
              console.error("Error adding user to company:", error);
              toast.error(error.message || "Failed to add user to company");
            }
          }}
          // Use all users from the users table (not filtered by company)
          users={allUsersForSelection}
          title="Add User to Company"
          description="Select an existing user from the platform to add as a client of your company"
          placeholder={loadingAllUsers ? "Loading users..." : "Select a user to add as client"}
          allowClear={true}
          error={false}
        />
      )}
    </div>
  );
}