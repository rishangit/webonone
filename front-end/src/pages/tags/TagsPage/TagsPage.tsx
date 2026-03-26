import { Plus, Tag as TagIcon, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { TagFormDialog } from "../TagFormDialog";
import { UserRole, isRole } from "@/types/user";
import { useTagsPage } from "./hooks/useTagsPage";
import {
  TagCard,
  TagsStats,
  TagsFilters,
  TagDeleteDialog,
} from "./components";
import { TagsPageProps } from "./types";

export const TagsPage = ({ currentUser }: TagsPageProps) => {
  const {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    setDebouncedSearchTerm,
    viewMode,
    setViewMode,
    selectedTag,
    setSelectedTag,
    showFormDialog,
    setShowFormDialog,
    dialogMode,
    showDeleteDialog,
    setShowDeleteDialog,
    tagToDelete,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    filterStatus,
    setFilterStatus,
    displayedTags,
    loading,
    pagination,
    stats,
    handleAddTag,
    handleEditTag,
    handleDeleteTag,
    confirmDelete,
    toggleTagStatus,
    handleClearFilters,
    refreshTags,
  } = useTagsPage(currentUser);

  // Only Super Admin can access this page
  if (!isRole(currentUser?.role, UserRole.SYSTEM_ADMIN)) {
    return (
      <div className="flex-1 p-4 lg:p-8 min-h-screen">
        <Card className="p-12 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            Only Super Administrators can access the Tags Management page.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-8 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-semibold text-foreground">Tags Management</h1>
            <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              <TagIcon className="w-3 h-3 mr-1" />
              Super Admin
            </Badge>
          </div>
          <p className="text-muted-foreground">Manage tags for companies and products</p>
        </div>
        <Button 
          variant="accent"
          onClick={handleAddTag}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tag
        </Button>
      </div>

      {/* Stats */}
      <TagsStats 
        total={stats.total}
        active={stats.active}
        inactive={stats.inactive}
        usage={stats.usage}
      />

      {/* Filters */}
      <TagsFilters
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onDebouncedSearchTermChange={setDebouncedSearchTerm}
        onClearFilters={handleClearFilters}
        resultsCount={displayedTags.length}
        debouncedSearchTerm={debouncedSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isFilterPanelOpen={isFilterPanelOpen}
        onFilterPanelOpenChange={setIsFilterPanelOpen}
      />

      {/* Body Container */}
      <div className="flex flex-col flex-1 min-h-[calc(100vh-300px)]">
        <div className="flex flex-col flex-1 min-h-0">
          {loading && displayedTags.length === 0 ? (
            <div className="flex-1">
              {viewMode === "list" ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, index) => (
                    <Card key={index} className="p-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="h-4 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(8)].map((_, index) => (
                    <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                            <div className="h-4 w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : displayedTags.length === 0 ? (
            <EmptyState
              icon={TagIcon}
              title="No tags found"
              description={
                debouncedSearchTerm 
                  ? "Try adjusting your search terms" 
                  : "Get started by creating your first tag"
              }
              action={{
                label: "Add Your First Tag",
                onClick: handleAddTag,
                variant: "accent",
                icon: Plus,
              }}
            />
          ) : (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1">
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                  : "space-y-4"
                }>
                  {displayedTags.map(tag => (
                    <TagCard 
                      key={tag.id}
                      tag={tag}
                      viewMode={viewMode}
                      onEdit={handleEditTag}
                      onDelete={handleDeleteTag}
                      onToggleStatus={toggleTagStatus}
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
          )}
        </div>
      </div>

      {/* Tag Form Dialog */}
      <TagFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        mode={dialogMode}
        tag={selectedTag}
        onSuccess={() => {
          setShowFormDialog(false);
          setSelectedTag(null);
          refreshTags();
        }}
      />

      <TagDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        tag={tagToDelete}
        onDelete={confirmDelete}
        loading={loading}
      />
    </div>
  );
};
