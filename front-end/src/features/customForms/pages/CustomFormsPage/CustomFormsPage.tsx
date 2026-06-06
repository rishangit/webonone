import { Plus, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { SearchInput } from '@/components/common/SearchInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCustomFormsPage } from '@/features/customForms/hooks';
import {
  CustomFormCard,
  CustomFormMetaDialog,
  CustomFormDeleteDialog,
} from './components';

export const CustomFormsPage = () => {
  const {
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
    itemsPerPageOptions,
    displayedForms,
    loading,
    pagination,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isMetaDialogOpen,
    setIsMetaDialogOpen,
    editingForm,
    formToDelete,
    handleOpenBuilder,
    handleEditMeta,
    handleAdd,
    handleMetaSubmit,
    handleDuplicate,
    handleDeleteClick,
    handleDeleteConfirm,
    handleClearFilters,
  } = useCustomFormsPage();

  const showSkeleton = loading && displayedForms.length === 0;

  return (
    <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Custom Forms</h1>
          <p className="text-muted-foreground mt-1">
            Design forms for appointments and client workflows
          </p>
        </div>
        <Button onClick={handleAdd} variant="accent">
          <Plus className="w-4 h-4 mr-2" />
          Add Form
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onDebouncedChange={setDebouncedSearchTerm}
          placeholder="Search forms..."
          className="sm:max-w-xs"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px] bg-[var(--input-background)] border-[var(--glass-border)]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="inactive">Inactive only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showSkeleton ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-40 animate-pulse bg-muted/30" />
          ))}
        </div>
      ) : displayedForms.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={debouncedSearchTerm || filterStatus !== 'all' ? 'No forms match' : 'No custom forms yet'}
          description={
            debouncedSearchTerm || filterStatus !== 'all'
              ? 'Try adjusting search or filters.'
              : 'Create your first form to collect data on appointments.'
          }
          action={
            debouncedSearchTerm || filterStatus !== 'all'
              ? { label: 'Clear filters', onClick: handleClearFilters }
              : { label: 'Add Form', onClick: handleAdd, variant: 'accent' as const }
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedForms.map((form) => (
              <CustomFormCard
                key={form.id}
                form={form}
                onEditMeta={handleEditMeta}
                onOpenBuilder={handleOpenBuilder}
                onDuplicate={handleDuplicate}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
          {pagination.total > itemsPerPage && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                itemsPerPageOptions={itemsPerPageOptions}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={pagination.total}
                showItemsPerPageSelector
              />
            </div>
          )}
        </>
      )}

      <CustomFormMetaDialog
        open={isMetaDialogOpen}
        onOpenChange={setIsMetaDialogOpen}
        form={editingForm}
        onSubmit={handleMetaSubmit}
        loading={loading}
      />
      <CustomFormDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        form={formToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
