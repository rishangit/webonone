import { useState, useEffect } from "react";
import { Package, Filter, Eye, MoreVertical } from "lucide-react";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import { SearchInput } from "../../../../../components/common/SearchInput";
import { ViewSwitcher } from "../../../../../components/ui/view-switcher";
import { Pagination } from "../../../../../components/common/Pagination";
import { RightPanel } from "../../../../../components/common/RightPanel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../../components/ui/dropdown-menu";
import { systemProductAttributesService, SystemProductAttribute } from "../../../../../services/systemProductAttributes";
import { unitsOfMeasureService, UnitsOfMeasure } from "../../../../../services/unitsOfMeasure";
import { toast } from "sonner";

export const CompanyProductAttributesTab = () => {
  const [systemAttributes, setSystemAttributes] = useState<SystemProductAttribute[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitsOfMeasure[]>([]);
  const [attributesLoading, setAttributesLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [valueDataTypeFilter, setValueDataTypeFilter] = useState("all");
  const [unitOfMeasureFilter, setUnitOfMeasureFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Fetch all system product attributes and units of measure
  useEffect(() => {
    const fetchSystemAttributes = async () => {
      setAttributesLoading(true);
      try {
        const [attributesResult, unitsResult] = await Promise.all([
          systemProductAttributesService.getAttributes({
            isActive: true,
            limit: 1000,
          }),
          unitsOfMeasureService.getActiveUnits(),
        ]);
        setSystemAttributes(attributesResult.attributes);
        setUnitsOfMeasure(unitsResult);
      } catch (error: any) {
        console.error("Error fetching system attributes:", error);
        toast.error(error.message || "Failed to load system attributes");
      } finally {
        setAttributesLoading(false);
      }
    };
    fetchSystemAttributes();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, valueDataTypeFilter, unitOfMeasureFilter, statusFilter]);

  // Filter attributes
  const filteredAttributes = systemAttributes.filter((attr) => {
    // Search filter
    const matchesSearch = !debouncedSearchTerm || 
      attr.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      attr.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

    // Data type filter
    const matchesDataType = valueDataTypeFilter === "all" || attr.valueDataType === valueDataTypeFilter;

    // Unit of measure filter
    const matchesUnit = unitOfMeasureFilter === "all" || 
      (unitOfMeasureFilter === "none" && !attr.unitOfMeasure) ||
      (unitOfMeasureFilter !== "none" && attr.unitOfMeasure === unitOfMeasureFilter);

    // Status filter
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && attr.isActive) ||
      (statusFilter === "inactive" && !attr.isActive);

    return matchesSearch && matchesDataType && matchesUnit && matchesStatus;
  });

  // Pagination calculations
  const totalItems = filteredAttributes.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAttributes = filteredAttributes.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasActiveFilters = valueDataTypeFilter !== "all" || unitOfMeasureFilter !== "all" || statusFilter !== "all" || debouncedSearchTerm !== "";

  // Render attribute card
  const renderAttributeCard = (attr: SystemProductAttribute) => {
    const unit = attr.unitOfMeasure 
      ? unitsOfMeasure.find(u => u.id === attr.unitOfMeasure)
      : null;

    return (
      <Card key={attr.id} className="p-6 backdrop-blur-xl border-[var(--glass-border)] transition-all duration-200 hover:border-[var(--accent-border)] bg-[var(--glass-bg)] hover:bg-[var(--glass-bg)]/80">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground">{attr.name}</h4>
              {!attr.isActive && (
                <Badge variant="outline" className="text-xs border-red-500/30 text-red-600 dark:text-red-400">
                  Inactive
                </Badge>
              )}
            </div>
            {attr.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{attr.description}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs border-[var(--glass-border)]">{attr.valueDataType}</Badge>
              {unit && (
                <Badge variant="outline" className="text-xs border-[var(--glass-border)]">
                  {unit.symbol}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/50 ml-2 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem className="text-foreground hover:bg-accent" disabled>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  };

  // Render attribute list item
  const renderAttributeListItem = (attr: SystemProductAttribute) => {
    const unit = attr.unitOfMeasure 
      ? unitsOfMeasure.find(u => u.id === attr.unitOfMeasure)
      : null;

    return (
      <Card key={attr.id} className="p-4 backdrop-blur-xl border-[var(--glass-border)] transition-all duration-200 hover:border-[var(--accent-border)] bg-[var(--glass-bg)] hover:bg-[var(--glass-bg)]/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground">{attr.name}</h4>
                {!attr.isActive && (
                  <Badge variant="outline" className="text-xs border-red-500/30 text-red-600 dark:text-red-400">
                    Inactive
                  </Badge>
                )}
              </div>
              {attr.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">{attr.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs border-[var(--glass-border)]">{attr.valueDataType}</Badge>
              {unit && (
                <Badge variant="outline" className="text-xs border-[var(--glass-border)]">
                  {unit.symbol}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/50 ml-2 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem className="text-foreground hover:bg-accent" disabled>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  };

  const filteredCount = filteredAttributes.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">System Product Attributes</h3>
          <p className="text-sm text-muted-foreground mt-1">
            All available system product attributes
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        <div className="space-y-4">
          <SearchInput
            placeholder="Search attributes..."
            value={searchTerm}
            onChange={setSearchTerm}
          />

          {/* Filter Button and View Switcher - All aligned to right */}
          <div className="flex items-center justify-end gap-3 flex-wrap">
            {/* Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterPanelOpen(true)}
              className={`h-9 ${
                hasActiveFilters
                  ? "bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent-text)] hover:bg-[var(--accent-primary)] hover:border-[var(--accent-primary)]"
                  : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
              }`}
            >
              <Filter className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>

            {/* View Switcher */}
            <ViewSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>
      </Card>

      {/* Filtered and Paginated Attributes */}
      {attributesLoading ? (
        <div className="text-center py-8">
          <div className="animate-pulse text-muted-foreground">Loading attributes...</div>
        </div>
      ) : paginatedAttributes.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedAttributes.map((attr) => renderAttributeCard(attr))}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedAttributes.map((attr) => renderAttributeListItem(attr))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              showItemCount={true}
              showItemsPerPageSelector={true}
              itemsPerPageOptions={[12, 24, 48, 96]}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1);
              }}
            />
          )}
        </>
      ) : (
        <Card className="p-12 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium text-foreground mb-2">
            {hasActiveFilters ? "No Attributes Found" : "No Attributes Available"}
          </h4>
          <p className="text-muted-foreground text-sm">
            {hasActiveFilters 
              ? "Try adjusting your filters or search query"
              : "No system product attributes are available."}
          </p>
        </Card>
      )}

      {/* Filter Panel */}
      <RightPanel
        open={isFilterPanelOpen}
        onOpenChange={setIsFilterPanelOpen}
        title="Filters"
        contentClassName="bg-background"
      >
        <div className="space-y-4">
          {/* Value Data Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Data Type</label>
            <Select value={valueDataTypeFilter} onValueChange={setValueDataTypeFilter}>
              <SelectTrigger className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                <SelectValue placeholder="All Data Types" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Data Types</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Unit of Measure Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Unit of Measure</label>
            <Select value={unitOfMeasureFilter} onValueChange={setUnitOfMeasureFilter}>
              <SelectTrigger className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                <SelectValue placeholder="All Units" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Units</SelectItem>
                <SelectItem value="none">No Unit</SelectItem>
                {unitsOfMeasure.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.unitName} ({unit.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Results Count and Clear */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Results</span>
                <Badge variant="outline" className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                  {filteredCount} attributes
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setValueDataTypeFilter("all");
                  setUnitOfMeasureFilter("all");
                  setStatusFilter("all");
                  setSearchTerm("");
                }}
                className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-accent hover:text-foreground"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </RightPanel>
    </div>
  );
};
