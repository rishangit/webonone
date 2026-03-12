import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { useWebpagesPage } from "./hooks";
import {
  WebpageCard,
  WebpagesFilters,
  WebpageDeleteDialog,
} from "./components";

export const WebpagesPage = () => {
  const {
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
    itemsPerPageOptions,
    filterStatus,
    setFilterStatus,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    displayedWebPages,
    filteredWebPages,
    loading,
    pagination,
    webPageToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleEdit,
    handleBrowse,
    handleDeleteClick,
    handleDeleteConfirm,
    handleClearFilters,
    handleAdd,
  } = useWebpagesPage();

  const showSkeleton = loading && displayedWebPages.length === 0;

  return (
    <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            Webpages Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your website pages
          </p>
        </div>
        <Button onClick={handleAdd} variant="accent">
          <Plus className="w-4 h-4 mr-2" />
          Add Webpage
        </Button>
      </div>

      {/* Search and Filters */}
      <WebpagesFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onDebouncedSearchTermChange={setDebouncedSearchTerm}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        onClearFilters={handleClearFilters}
        resultsCount={filteredWebPages.length}
        debouncedSearchTerm={debouncedSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isFilterPanelOpen={isFilterPanelOpen}
        onFilterPanelOpenChange={setIsFilterPanelOpen}
      />

      {/* Body */}
      <div className="flex flex-col flex-1 min-h-[calc(100vh-300px)]">
        <div className="flex flex-col flex-1 min-h-0">
          {showSkeleton ? (
            <div className="flex-1">
              {viewMode === "list" ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <Card
                      key={i}
                      className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card
                      key={i}
                      className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          <div>
                            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      </div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : displayedWebPages.length > 0 ? (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedWebPages.map((webPage) => (
                      <WebpageCard
                        key={webPage.id}
                        webPage={webPage}
                        viewMode="grid"
                        onEdit={handleEdit}
                        onBrowse={handleBrowse}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedWebPages.map((webPage) => (
                      <WebpageCard
                        key={webPage.id}
                        webPage={webPage}
                        viewMode="list"
                        onEdit={handleEdit}
                        onBrowse={handleBrowse}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </div>
                )}
              </div>
              {pagination.total > 0 && (
                <div className="mt-auto pt-4">
                  <Pagination
                    totalItems={pagination.total}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    showItemsPerPageSelector
                    itemsPerPageOptions={itemsPerPageOptions}
                    onItemsPerPageChange={(newSize) => {
                      setItemsPerPage(newSize);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No webpages found"
              description={
                searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first webpage to get started"
              }
              action={{
                label: "Add Webpage",
                onClick: handleAdd,
                variant: "accent",
                icon: Plus,
              }}
            />
          )}
        </div>
      </div>

      <WebpageDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        webPage={webPageToDelete}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
};
