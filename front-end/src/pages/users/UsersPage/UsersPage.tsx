import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { CreateUserDialog } from "../CreateUserDialog";
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog";
import { UserSelectionDialog } from "@/components/common/UserSelectionDialog";
import { useUsersPage } from "./hooks/useUsersPage";
import {
  UsersStats,
  UsersFilters,
  UsersList,
  LoadingSkeleton,
} from "./components";
import { UsersPageProps } from "./types";
import { UserRoleNames, UserRole } from "@/types/user";
import { useAppDispatch } from "@/store/hooks";
import { fetchUsersRequest } from "@/store/slices/usersSlice";
import { usersService } from "@/services/users";
import { toast } from "sonner";

export const UsersPage = (props: UsersPageProps) => {
  const dispatch = useAppDispatch();
  const {
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
    loading,
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
    currentUser,
    onViewProfile,
    onViewAppointments,
  } = useUsersPage(props);

  const showSkeleton = loading && displayedUsers.length === 0;

  return (
    <div className="flex flex-col min-h-0 p-4 lg:p-6 flex-1">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{pageTitle}</h1>
            <p className="text-muted-foreground mt-1">{pageDescription}</p>
          </div>
          {!isSystemAdmin && isCompanyOwner && companyId && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
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

        {/* Stats Cards */}
        <UsersStats
          totalUsers={pageStats.totalUsers}
          activeUsers={pageStats.activeUsers}
          totalCompanyOwners={pageStats.totalCompanyOwners}
          totalStaffMembers={pageStats.totalStaffMembers}
        />

        {/* Search and Filters Section */}
        <UsersFilters
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onDebouncedSearchTermChange={setDebouncedSearchTerm}
          selectedStatus={selectedStatus}
          onSelectedStatusChange={setSelectedStatus}
          selectedRole={selectedRole}
          onSelectedRoleChange={setSelectedRole}
          uniqueStatuses={uniqueStatuses}
          uniqueRoles={uniqueRoles}
          debouncedSearchTerm={debouncedSearchTerm}
          resultsCount={displayedUsers.length}
          onClearFilters={handleClearFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isFilterPanelOpen={isFilterPanelOpen}
          onFilterPanelOpenChange={setIsFilterPanelOpen}
          isSystemAdmin={isSystemAdmin}
        />

        {/* Body Container */}
        <div className="flex flex-col flex-1 min-h-[calc(100vh-300px)]">
          <div className="flex flex-col flex-1 min-h-0">
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

            {/* Loading State */}
            {showSkeleton ? (
              <div className="flex-1">
                <LoadingSkeleton viewMode={viewMode} />
              </div>
            ) : displayedUsers.length > 0 ? (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex-1">
                  <UsersList
                    users={displayedUsers}
                    viewMode={viewMode}
                    currentUser={currentUser}
                    onViewProfile={onViewProfile}
                    onViewAppointments={onViewAppointments}
                    onImpersonate={isSystemAdmin ? handleImpersonate : undefined}
                    isSystemAdmin={isSystemAdmin}
                  />
                </div>
                {/* Pagination */}
                {pagination && pagination.total > 0 && (
                  <div className="mt-auto pt-4">
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
                  </div>
                )}
              </div>
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

        {/* Create new platform user (for company owners) */}
        {isCompanyOwner && companyId && (
          <CreateUserDialog
            open={isCreateUserDialogOpen}
            onOpenChange={setIsCreateUserDialogOpen}
            companyId={companyId}
            onSuccess={refreshUsers}
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
                refreshUsers();
              } catch (error: any) {
                console.error("Error adding user to company:", error);
                toast.error(error.message || "Failed to add user to company");
              }
            }}
            users={allUsersForSelection}
            title="Add User to Company"
            description="Select an existing user from the platform to add as a client of your company"
            placeholder={loadingAllUsers ? "Loading users..." : "Select a user to add as client"}
            allowClear={true}
            error={false}
          />
        )}
      </div>
    </div>
  );
};
