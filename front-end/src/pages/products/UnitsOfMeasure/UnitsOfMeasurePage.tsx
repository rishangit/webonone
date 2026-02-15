import { useState, useEffect, useMemo } from "react";
import { Plus, Ruler, AlertTriangle, Filter } from "lucide-react";
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
  fetchUnitsOfMeasureRequest,
  createUnitOfMeasureRequest,
  updateUnitOfMeasureRequest,
  deleteUnitOfMeasureRequest,
  clearError as clearUnitsOfMeasureError,
} from "../../../store/slices/unitsOfMeasureSlice";
import { UnitsOfMeasure, CreateUnitsOfMeasureData } from "../../../services/unitsOfMeasure";
import { UserRole, isRole } from "../../../types/user";
import { DeleteConfirmationDialog } from "../../../components/common/DeleteConfirmationDialog";
import { Pagination } from "../../../components/common/Pagination";
import { UnitOfMeasureAddEditDialog } from "./UnitOfMeasureAddEditDialog";
import { UnitOfMeasureCard } from "./UnitOfMeasureCard";
import { UnitOfMeasureListItem } from "./UnitOfMeasureListItem";
import { UnitOfMeasureFilters } from "./UnitOfMeasureFilters";

interface UnitsOfMeasurePageProps {
  currentUser?: {
    email: string;
    role: string | number | UserRole;
    name?: string;
    companyId?: string;
    id?: string;
  } | null;
}

export const UnitsOfMeasurePage = ({ currentUser }: UnitsOfMeasurePageProps) => {
  const dispatch = useAppDispatch();
  const { unitsOfMeasure, loading, error, pagination } = useAppSelector((state) => state.unitsOfMeasure);
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
            Only Super Administrators can access the Units of Measure page.
          </p>
        </Card>
      </div>
    );
  }

  // State declarations
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitsOfMeasure | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<UnitsOfMeasure | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState<CreateUnitsOfMeasureData>({
    unitName: "",
    symbol: "",
    baseUnit: null,
    multiplier: 1.0,
    isActive: true,
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch units when filters change
  useEffect(() => {
    const filters: any = {
      page: currentPage,
      limit: 12,
      search: debouncedSearchTerm || undefined,
    };

    if (statusFilter !== "all") {
      filters.isActive = statusFilter === "active";
    }

    dispatch(fetchUnitsOfMeasureRequest(filters));
  }, [dispatch, debouncedSearchTerm, statusFilter, currentPage]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearUnitsOfMeasureError());
    };
  }, [dispatch]);

  // Handle create
  const handleCreate = () => {
    if (!formData.unitName || !formData.symbol) {
      toast.error("Unit Name and Symbol are required");
      return;
    }

    dispatch(createUnitOfMeasureRequest(formData));
    setShowCreateDialog(false);
    setFormData({
      unitName: "",
      symbol: "",
      baseUnit: null,
      multiplier: 1.0,
      isActive: true,
    });
  };

  // Handle edit
  const handleEdit = (unit: UnitsOfMeasure) => {
    setSelectedUnit(unit);
    setFormData({
      unitName: unit.unitName,
      symbol: unit.symbol,
      baseUnit: unit.baseUnit || null,
      multiplier: unit.multiplier,
      isActive: unit.isActive,
    });
    setShowEditDialog(true);
  };

  // Handle update
  const handleUpdate = () => {
    if (!selectedUnit || !formData.unitName || !formData.symbol) {
      toast.error("Unit Name and Symbol are required");
      return;
    }

    dispatch(updateUnitOfMeasureRequest({ id: selectedUnit.id, data: formData }));
    setShowEditDialog(false);
    setSelectedUnit(null);
  };

  // Handle delete
  const handleDelete = (unit: UnitsOfMeasure) => {
    setUnitToDelete(unit);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (unitToDelete) {
      dispatch(deleteUnitOfMeasureRequest(unitToDelete.id));
      setUnitToDelete(null);
    }
  };

  // Get base unit name
  const getBaseUnitName = (baseUnitId: string | null | undefined) => {
    if (!baseUnitId) return "None";
    const baseUnit = unitsOfMeasure.find(u => u.id === baseUnitId);
    return baseUnit ? `${baseUnit.unitName} (${baseUnit.symbol})` : baseUnitId;
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Filtered units (client-side filtering for display)
  const displayedUnits = useMemo(() => {
    return unitsOfMeasure;
  }, [unitsOfMeasure]);

  // Check if filters are active
  const hasActiveFilters = debouncedSearchTerm || statusFilter !== "all";

  return (
    <div className="flex-1 p-4 lg:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Ruler className="w-8 h-8" />
              Units of Measure
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage measurement units for product attributes
            </p>
          </div>
          <Button
            variant="accent"
            onClick={() => {
              setFormData({
                unitName: "",
                symbol: "",
                baseUnit: null,
                multiplier: 1.0,
                isActive: true,
              });
              setShowCreateDialog(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isMobile ? "Add" : "Add Unit"}
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <div className="space-y-4">
            {/* Search */}
            <SearchInput
              placeholder="Search units by name or symbol..."
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

        {/* Units Grid/List */}
        {loading && displayedUnits.length === 0 ? (
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
                            <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          </div>
                        </div>
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
                        <div className="flex flex-wrap gap-1">
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
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : displayedUnits.length > 0 ? (
          <>
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
              {displayedUnits.map((unit) => (
                viewMode === "list" ? (
                  <UnitOfMeasureListItem
                    key={unit.id}
                    unit={unit}
                    unitsOfMeasure={unitsOfMeasure}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    getBaseUnitName={getBaseUnitName}
                  />
                ) : (
                  <UnitOfMeasureCard
                    key={unit.id}
                    unit={unit}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    getBaseUnitName={getBaseUnitName}
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
            icon={Ruler}
            title="No units found"
            description={
              hasActiveFilters
                ? "Try adjusting your filters to see more units"
                : "Get started by creating a new unit of measure."
            }
            action={{
              label: "Add Unit",
              onClick: () => setShowCreateDialog(true),
              variant: "accent",
              icon: Plus,
            }}
          />
        )}

        {/* Create Dialog */}
        <UnitOfMeasureAddEditDialog
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
        <UnitOfMeasureAddEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          mode="edit"
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleUpdate}
          unitsOfMeasure={unitsOfMeasure}
          selectedUnitId={selectedUnit?.id}
          loading={loading}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={!!unitToDelete}
          onOpenChange={(open) => !open && setUnitToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete Unit of Measure"
          description={`Are you sure you want to delete "${unitToDelete?.unitName}"? This action cannot be undone.`}
        />

        {/* Filter Right Panel */}
        <UnitOfMeasureFilters
          open={isFilterPanelOpen}
          onOpenChange={setIsFilterPanelOpen}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          resultsCount={displayedUnits.length}
        />
      </div>
    </div>
  );
};
