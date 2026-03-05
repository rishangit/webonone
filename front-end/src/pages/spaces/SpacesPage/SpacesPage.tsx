import { Plus, MapPin } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Pagination } from "../../../components/common/Pagination";
import { EmptyState } from "../../../components/common/EmptyState";
import { useSpacesPage } from "./hooks/useSpacesPage";
import {
  SpaceCard,
  SpacesFilters,
  SpaceAddEditDialog,
  SpaceViewDialog,
  SpaceDeleteDialog,
} from "./components";

export const SpacesPage = () => {
  const {
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    setDebouncedSearchTerm,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    selectedSpace,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isViewDialogOpen,
    setIsViewDialogOpen,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    formData,
    displayedSpaces,
    loading,
    pagination,
    companyId,
    openAddDialog,
    openEditDialog,
    openViewDialog,
    openDeleteDialog,
    handleImageUploaded,
    handleImageDeleted,
    handleSave,
    handleDelete,
    handleFormDataChange,
    handleClearFilters,
  } = useSpacesPage();

  return (
    <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Spaces Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage your company's rooms, sections, and facilities</p>
        </div>
        <Button 
          variant="accent" 
          className="w-full sm:w-auto text-sm" 
          onClick={openAddDialog}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Space
        </Button>
      </div>

      {/* Filters */}
      <SpacesFilters
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onDebouncedSearchTermChange={setDebouncedSearchTerm}
        onClearFilters={handleClearFilters}
        resultsCount={displayedSpaces.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isFilterPanelOpen={isFilterPanelOpen}
        onFilterPanelOpenChange={setIsFilterPanelOpen}
        debouncedSearchTerm={debouncedSearchTerm}
      />

      {/* Body Container */}
      <div className="flex flex-col flex-1 min-h-[calc(100vh-300px)]">
        <div className="flex flex-col flex-1 min-h-0">
          {loading && displayedSpaces.length === 0 ? (
            <div className="flex-1">
              {viewMode === "list" ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, index) => (
                    <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-6">
                        <div className="flex-shrink-0 w-20 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                              <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                          </div>
                          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
                          <div className="flex items-center justify-end">
                            <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, index) => (
                    <Card key={index} className="overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 animate-pulse">
                        <div className="absolute top-3 left-3">
                          <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                          </div>
                          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : displayedSpaces.length > 0 ? (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedSpaces.map((space) => (
                      <SpaceCard 
                        key={space.id} 
                        space={space}
                        viewMode={viewMode}
                        onView={openViewDialog}
                        onEdit={openEditDialog}
                        onDelete={openDeleteDialog}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedSpaces.map((space) => (
                      <SpaceCard 
                        key={space.id} 
                        space={space}
                        viewMode={viewMode}
                        onView={openViewDialog}
                        onEdit={openEditDialog}
                        onDelete={openDeleteDialog}
                      />
                    ))}
                  </div>
                )}
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
              icon={MapPin}
              title="No spaces found"
              description={
                debouncedSearchTerm || filterStatus !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : "You haven't added any spaces yet"
              }
              action={{
                label: "Add Your First Space",
                onClick: openAddDialog,
                variant: "accent",
                icon: Plus,
              }}
            />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <SpaceAddEditDialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
          }
        }}
        isEdit={isEditDialogOpen}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        onSave={handleSave}
        companyId={companyId}
        onImageUploaded={handleImageUploaded}
        onImageDeleted={handleImageDeleted}
      />

      {selectedSpace && (
        <SpaceViewDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          space={selectedSpace}
        />
      )}

      <SpaceDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        space={selectedSpace}
        onDelete={handleDelete}
      />
    </div>
  );
};
