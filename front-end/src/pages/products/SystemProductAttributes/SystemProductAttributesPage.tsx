import { useState, useEffect, useMemo } from "react";
import { Plus, ListChecks, AlertTriangle, Filter } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { SearchInput } from "../../../components/common/SearchInput";
import { EmptyState } from "../../../components/common/EmptyState";
import { ViewSwitcher } from "../../../components/ui/view-switcher";
import { useIsMobile } from "../../../components/ui/use-mobile";
import { cn } from "../../../components/ui/utils";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchSystemProductAttributesRequest,
  createSystemProductAttributeRequest,
  updateSystemProductAttributeRequest,
  deleteSystemProductAttributeRequest,
  clearError as clearSystemProductAttributesError,
} from "../../../store/slices/systemProductAttributesSlice";
import { fetchUnitsOfMeasureRequest } from "../../../store/slices/unitsOfMeasureSlice";
import { SystemProductAttribute, CreateSystemProductAttributeData } from "../../../services/systemProductAttributes";
import { UserRole, isRole } from "../../../types/user";
import { DeleteConfirmationDialog } from "../../../components/common/DeleteConfirmationDialog";
import { Pagination } from "../../../components/common/Pagination";
import { ProductAttributeAddEditDialog } from "./ProductAttributeAddEditDialog";
import { ProductAttributeCard } from "./ProductAttributeCard";
import { ProductAttributeListItem } from "./ProductAttributeListItem";
import { ProductAttributeFilters } from "./ProductAttributeFilters";

interface SystemProductAttributesPageProps {
  currentUser?: {
    email: string;
    role: string | number | UserRole;
    name?: string;
    companyId?: string;
    id?: string;
  } | null;
}

export const SystemProductAttributesPage = ({ currentUser }: SystemProductAttributesPageProps) => {
  const dispatch = useAppDispatch();
  const { systemProductAttributes, loading, error, pagination } = useAppSelector((state) => state.systemProductAttributes);
  const { unitsOfMeasure } = useAppSelector((state) => state.unitsOfMeasure);
  const isMobile = useIsMobile();
  
  const isSuperAdmin = isRole(currentUser?.role, UserRole.SYSTEM_ADMIN);

  // Only Super Admin can access this page
  if (!isSuperAdmin) {
    return (
      <div className="flex-1 p-4 lg:p-8 min-h-screen">
        <Card className="p-12 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            Only Super Administrators can access the Product Attributes page.
          </p>
        </Card>
      </div>
    );
  }

  // State declarations
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [valueDataTypeFilter, setValueDataTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<SystemProductAttribute | null>(null);
  const [attributeToDelete, setAttributeToDelete] = useState<SystemProductAttribute | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState<CreateSystemProductAttributeData>({
    name: "",
    description: "",
    valueDataType: "text",
    unitOfMeasure: null,
    isActive: true,
  });

  // Load units of measure for dropdown
  useEffect(() => {
    if (unitsOfMeasure.length === 0) {
      dispatch(fetchUnitsOfMeasureRequest({ isActive: true }));
    }
  }, [dispatch, unitsOfMeasure.length]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch attributes when filters change
  useEffect(() => {
    const filters: any = {
      page: currentPage,
      limit: 12,
      search: debouncedSearchTerm || undefined,
    };

    if (statusFilter !== "all") {
      filters.isActive = statusFilter === "active";
    }

    if (valueDataTypeFilter !== "all") {
      filters.valueDataType = valueDataTypeFilter;
    }

    dispatch(fetchSystemProductAttributesRequest(filters));
  }, [dispatch, debouncedSearchTerm, statusFilter, valueDataTypeFilter, currentPage]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearSystemProductAttributesError());
    };
  }, [dispatch]);

  // Handle create
  const handleCreate = () => {
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    // Only send allowed fields
    const createData: CreateSystemProductAttributeData = {
      name: formData.name,
      description: formData.description || null,
      valueDataType: formData.valueDataType || "text",
      unitOfMeasure: formData.unitOfMeasure || null,
      isActive: formData.isActive ?? true,
    };

    dispatch(createSystemProductAttributeRequest(createData));
    setShowCreateDialog(false);
    setFormData({
      name: "",
      description: "",
      valueDataType: "text",
      unitOfMeasure: null,
      isActive: true,
    });
  };

  // Handle edit
  const handleEdit = (attribute: SystemProductAttribute) => {
    setSelectedAttribute(attribute);
    setFormData({
      name: attribute.name,
      description: attribute.description || "",
      valueDataType: attribute.valueDataType,
      unitOfMeasure: attribute.unitOfMeasure || null,
      isActive: attribute.isActive,
    });
    setShowEditDialog(true);
  };

  // Handle update
  const handleUpdate = () => {
    if (!selectedAttribute || !formData.name) {
      toast.error("Name is required");
      return;
    }

    dispatch(updateSystemProductAttributeRequest({ id: selectedAttribute.id, data: formData }));
    setShowEditDialog(false);
    setSelectedAttribute(null);
  };

  // Handle delete
  const handleDelete = (attribute: SystemProductAttribute) => {
    setAttributeToDelete(attribute);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (attributeToDelete) {
      dispatch(deleteSystemProductAttributeRequest(attributeToDelete.id));
      setAttributeToDelete(null);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setStatusFilter("all");
    setValueDataTypeFilter("all");
    setCurrentPage(1);
  };

  // Filtered attributes (client-side filtering for display)
  const displayedAttributes = useMemo(() => {
    return systemProductAttributes;
  }, [systemProductAttributes]);

  // Check if filters are active
  const hasActiveFilters = debouncedSearchTerm || statusFilter !== "all" || valueDataTypeFilter !== "all";

  return (
    <div className="flex-1 p-4 lg:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ListChecks className="w-8 h-8" />
              Product Attributes
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage attributes for system products
            </p>
          </div>
          <Button
            variant="accent"
            onClick={() => {
              setFormData({
                name: "",
                description: "",
                valueDataType: "text",
                unitOfMeasure: null,
                isActive: true,
              });
              setShowCreateDialog(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isMobile ? "Add" : "Add Attribute"}
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <div className="space-y-4">
            {/* Search */}
            <SearchInput
              placeholder="Search attributes by name or description..."
              value={searchTerm}
              onChange={setSearchTerm}
              onDebouncedChange={setDebouncedSearchTerm}
              debounceDelay={500}
            />

            {/* Filter Button and View Switcher - All aligned to right */}
            <div className="flex items-center justify-end gap-3 flex-wrap">
              {/* Filter Button */}
              <Button 
                variant="outline" 
                onClick={() => setIsFilterPanelOpen(true)}
                className={cn(
                  "h-9",
                  hasActiveFilters
                    ? "bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent-text)] hover:bg-[var(--accent-primary)] hover:border-[var(--accent-primary)]"
                    : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
                )}
              >
                <Filter className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Filter</span>
              </Button>

              {/* View Switcher */}
              <ViewSwitcher
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-red-500/10 border-red-500/20">
            <p className="text-red-500 text-sm">{error}</p>
          </Card>
        )}

        {/* Attributes Grid/List */}
        {loading && displayedAttributes.length === 0 ? (
          <>
            {viewMode === "list" ? (
              /* Skeleton for List View */
              <div className="space-y-4">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="min-w-0 flex-1 mr-2">
                            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          </div>
                        </div>
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
                        <div className="flex flex-wrap gap-1">
                          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              /* Skeleton for Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                      </div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : displayedAttributes.length > 0 ? (
          <>
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
              {displayedAttributes.map((attribute) => (
                viewMode === "list" ? (
                  <ProductAttributeListItem
                    key={attribute.id}
                    attribute={attribute}
                    unitsOfMeasure={unitsOfMeasure}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ) : (
                  <ProductAttributeCard
                    key={attribute.id}
                    attribute={attribute}
                    unitsOfMeasure={unitsOfMeasure}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                totalItems={pagination.total}
                itemsPerPage={12}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <EmptyState
            icon={ListChecks}
            title="No attributes found"
            description={
              hasActiveFilters
                ? "Try adjusting your filters to see more attributes"
                : "Get started by creating a new product attribute."
            }
            action={{
              label: "Add Attribute",
              onClick: () => setShowCreateDialog(true),
              variant: "accent",
              icon: Plus,
            }}
          />
        )}

        {/* Create Dialog */}
        <ProductAttributeAddEditDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          mode="create"
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleCreate}
          unitsOfMeasure={unitsOfMeasure}
          loading={loading}
        />

        {/* Edit Dialog */}
        <ProductAttributeAddEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          mode="edit"
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleUpdate}
          unitsOfMeasure={unitsOfMeasure}
          loading={loading}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={!!attributeToDelete}
          onOpenChange={(open) => !open && setAttributeToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete Product Attribute"
          description={`Are you sure you want to delete "${attributeToDelete?.name}"? This action cannot be undone.`}
        />

        {/* Filter Right Panel */}
        <ProductAttributeFilters
          open={isFilterPanelOpen}
          onOpenChange={setIsFilterPanelOpen}
          statusFilter={statusFilter}
          valueDataTypeFilter={valueDataTypeFilter}
          onStatusFilterChange={setStatusFilter}
          onValueDataTypeFilterChange={setValueDataTypeFilter}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          resultsCount={displayedAttributes.length}
        />
      </div>
    </div>
  );
};
