import { UserPlus, Shield } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Pagination } from "../../../components/common/Pagination";
import { EmptyState } from "../../../components/common/EmptyState";
import { StaffDetailPage } from "../StaffDetailPage";
import { AddStaffDialog } from "../addStaff/AddStaffDialog";
import { StaffDetailDialog } from "../StaffDetailDialog";
import { useStaffPage } from "./hooks/useStaffPage";
import {
  StaffCard,
  StaffFilters,
  StaffDeleteDialog,
} from "./components";
import { StaffPageProps } from "./types";

export const StaffPage = ({ currentUser }: StaffPageProps) => {
  const {
    staffId,
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
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    filterDepartment,
    setFilterDepartment,
    isAddStaffDialogOpen,
    setIsAddStaffDialogOpen,
    selectedStaff,
    setSelectedStaff,
    isStaffDetailDialogOpen,
    setIsStaffDetailDialogOpen,
    staffToDelete,
    isDeleteConfirmDialogOpen,
    setIsDeleteConfirmDialogOpen,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    displayedStaff,
    loading,
    pagination,
    companyId,
    uniqueRoles,
    uniqueDepartments,
    handleAddStaff,
    handleEditStaff,
    handleDeleteStaff,
    handleDeleteClick,
    handleViewStaff,
    handleClearFilters,
  } = useStaffPage(currentUser);

  // Early returns AFTER all hooks have been called
  // If staffId is in URL, show detail view
  if (staffId) {
    return (
      <StaffDetailPage
        staffId={staffId}
        onBack={() => window.history.back()}
        currentUser={currentUser}
      />
    );
  }

  // Redirect regular users
  if (currentUser?.role === "User") {
    return (
      <div className="flex-1 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)] rounded-xl p-8">
            <Shield className="w-16 h-16 mx-auto mb-4 text-[var(--accent-text)]" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">Access Restricted</h2>
            <p className="text-muted-foreground mb-6">
              Staff management is only available to company owners and administrators.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const showSkeleton = loading && displayedStaff.length === 0;

  return (
    <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members, roles, and permissions
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedStaff(null);
            setIsAddStaffDialogOpen(true);
          }}
          variant="accent"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Filters */}
      <StaffFilters
        filterRole={filterRole}
        onFilterRoleChange={setFilterRole}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filterDepartment={filterDepartment}
        onFilterDepartmentChange={setFilterDepartment}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onDebouncedSearchTermChange={setDebouncedSearchTerm}
        onClearFilters={handleClearFilters}
        resultsCount={displayedStaff.length}
        uniqueRoles={uniqueRoles}
        uniqueDepartments={uniqueDepartments}
        debouncedSearchTerm={debouncedSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isFilterPanelOpen={isFilterPanelOpen}
        onFilterPanelOpenChange={setIsFilterPanelOpen}
      />

      {/* Body Container */}
      <div className="flex flex-col flex-1 min-h-[calc(100vh-300px)]">
        <div className="flex flex-col flex-1 min-h-0">
          {showSkeleton ? (
            <div className="flex-1">
              {viewMode === "list" ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, index) => (
                    <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                              <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                              <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                          </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, index) => (
                    <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                          <div>
                            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      </div>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : displayedStaff.length > 0 ? (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1">
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
                  {displayedStaff.map((member) => (
                    <StaffCard 
                      key={member.id} 
                      member={member}
                      viewMode={viewMode}
                      onView={handleViewStaff}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              </div>
              {pagination && (
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
              icon={UserPlus}
              title="No staff members found"
              description={
                debouncedSearchTerm || filterRole !== "all" || filterStatus !== "all" || filterDepartment !== "all"
                  ? "Try adjusting your filters to see more staff members"
                  : "You haven't added any staff members yet"
              }
              action={{
                label: "Add Your First Staff Member",
                onClick: () => {
                  setSelectedStaff(null);
                  setIsAddStaffDialogOpen(true);
                },
                variant: "accent",
                icon: UserPlus,
              }}
            />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddStaffDialog
        open={isAddStaffDialogOpen}
        onOpenChange={(open) => {
          setIsAddStaffDialogOpen(open);
          if (!open) {
            setSelectedStaff(null);
          }
        }}
        onAddStaff={handleAddStaff}
        editingStaff={selectedStaff ? {
          id: selectedStaff.id,
          userId: selectedStaff.userId,
          role: selectedStaff.role || "",
          permissions: typeof selectedStaff.permissions === 'object' ? selectedStaff.permissions : {},
          workSchedule: selectedStaff.workSchedule
        } : null}
        onEditStaff={handleEditStaff}
        companyId={companyId}
      />

      {selectedStaff && (
        <StaffDetailDialog
          open={isStaffDetailDialogOpen}
          onOpenChange={setIsStaffDetailDialogOpen}
          staff={selectedStaff}
          onEdit={() => {
            setIsStaffDetailDialogOpen(false);
            setIsAddStaffDialogOpen(true);
          }}
        />
      )}

      <StaffDeleteDialog
        open={isDeleteConfirmDialogOpen}
        onOpenChange={setIsDeleteConfirmDialogOpen}
        member={staffToDelete}
        onDelete={() => {
          if (staffToDelete) {
            handleDeleteStaff(staffToDelete.id);
          }
        }}
      />
    </div>
  );
};
