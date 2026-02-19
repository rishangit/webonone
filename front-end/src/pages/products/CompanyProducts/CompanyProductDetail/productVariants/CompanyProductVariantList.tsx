import { useState, useEffect } from "react";
import { Plus, Package, Star, MoreVertical, Warehouse, Eye, Edit, Trash2, Filter } from "lucide-react";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../../components/ui/dropdown-menu";
import { SearchInput } from "../../../../../components/common/SearchInput";
import { ViewSwitcher } from "../../../../../components/ui/view-switcher";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";
import { RightPanel } from "../../../../../components/common/RightPanel";
import { cn } from "../../../../../components/ui/utils";
import { CompanyProductVariant } from "../../../../../services/companyProductVariants";
import { DeleteConfirmationDialog } from "../../../../../components/common/DeleteConfirmationDialog";
import { VariantDialog } from "../../../Variants/VariantDialog";
import { VariantFormData } from "../../../../../schemas/variantValidation";

interface CompanyProductVariantListProps {
  variants: CompanyProductVariant[];
  variantsLoading: boolean;
  selectedVariantId: string | null;
  systemProductId: string | null;
  onVariantSelect: (variant: CompanyProductVariant | null) => void;
  onAddVariant: () => void;
  onEditVariant: (variant: CompanyProductVariant) => void;
  onViewVariant: (variant: CompanyProductVariant) => void;
  onDeleteVariant: (variantId: string) => void;
  onSetAsDefault: (variant: CompanyProductVariant) => void;
  onViewStockDetails: (variant: CompanyProductVariant) => void;
  onSaveVariant: (variantData: VariantFormData) => Promise<void>;
}

export const CompanyProductVariantList = ({
  variants,
  variantsLoading,
  selectedVariantId,
  systemProductId,
  onVariantSelect,
  onAddVariant,
  onEditVariant,
  onViewVariant,
  onDeleteVariant,
  onSetAsDefault,
  onViewStockDetails,
  onSaveVariant,
}: CompanyProductVariantListProps) => {
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [variantDialogMode, setVariantDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [variantDialogVariant, setVariantDialogVariant] = useState<CompanyProductVariant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<CompanyProductVariant | null>(null);
  
  // Search and view state
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterDefault, setFilterDefault] = useState<"all" | "default" | "non-default">("all");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const handleAddVariant = () => {
    setVariantDialogVariant(null);
    setVariantDialogMode('add');
    setVariantDialogOpen(true);
  };

  const handleEditVariant = (variant: CompanyProductVariant) => {
    setVariantDialogVariant(variant);
    setVariantDialogMode('edit');
    setVariantDialogOpen(true);
  };

  const handleViewVariant = (variant: CompanyProductVariant) => {
    setVariantDialogVariant(variant);
    setVariantDialogMode('view');
    setVariantDialogOpen(true);
  };

  const handleDeleteClick = (variant: CompanyProductVariant) => {
    setVariantToDelete(variant);
    setDeleteDialogOpen(true);
  };

  const handleSaveVariantWrapper = async (variantData: VariantFormData) => {
    await onSaveVariant(variantData);
    setVariantDialogOpen(false);
    setVariantDialogVariant(null);
  };

  // Filter variants based on search term and filters
  const filteredVariants = variants.filter((variant) => {
    // Search filter
    const matchesSearch = 
      variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variant.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;

    // Status filter
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "active" && variant.isActive) ||
      (filterStatus === "inactive" && !variant.isActive);

    // Default filter
    const matchesDefault = 
      filterDefault === "all" ||
      (filterDefault === "default" && variant.isDefault) ||
      (filterDefault === "non-default" && !variant.isDefault);

    return matchesSearch && matchesStatus && matchesDefault;
  });

  // Reset search when variants change
  useEffect(() => {
    if (variants.length === 0) {
      setSearchTerm("");
    }
  }, [variants.length]);

  // Render variant card (for grid view)
  const renderVariantCard = (variant: CompanyProductVariant) => (
    <Card 
      key={variant.id} 
      className={`p-4 transition-all duration-200 hover:shadow-md ${
        selectedVariantId === variant.id 
          ? 'ring-2 ring-[var(--accent-primary)] bg-[var(--accent-bg)] border-[var(--accent-primary)]/30' 
          : variant.isDefault
          ? 'border-0 border-2 border-[var(--accent-primary)]'
          : 'border bg-card hover:bg-accent/50'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-foreground leading-tight">{variant.name}</h4>
              {variant.isDefault && (
                <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Default
                </Badge>
              )}
              <Badge className={variant.isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                {variant.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {variant.sku && (
              <p className="text-xs text-muted-foreground mb-2">SKU: {variant.sku}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-accent text-muted-foreground hover:text-foreground ml-2">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border" align="end">
              {!variant.isDefault && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSetAsDefault(variant); }} className="text-popover-foreground hover:bg-sidebar-accent">
                  <Star className="w-4 h-4 mr-2" />
                  Set as Default
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewStockDetails(variant); }} className="text-popover-foreground hover:bg-sidebar-accent">
                <Warehouse className="w-4 h-4 mr-2" />
                Stock Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewVariant(variant); }} className="text-popover-foreground hover:bg-sidebar-accent">
                <Eye className="w-4 h-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditVariant(variant); }} className="text-popover-foreground hover:bg-sidebar-accent">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteClick(variant); }} className="text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stock Information */}
        <div className="pt-2">
          {/* Active Stock Amount */}
          <div className="flex items-center gap-2 text-sm mb-2">
            <span className="text-muted-foreground">Active Stock:</span>
            <span className="text-[var(--accent-primary)] font-semibold">{variant.activeStock?.quantity || 0}</span>
          </div>
          
          {/* Stock Progress Bar */}
          {variant.maxStock !== undefined && variant.maxStock > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>
                  Stock: {variant.activeStock?.quantity || 0} / {variant.maxStock}
                </span>
                <span>
                  {Math.round(((variant.activeStock?.quantity || 0) / variant.maxStock) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    (variant.activeStock?.quantity || 0) < (variant.minStock || 0)
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ 
                    width: `${Math.min(((variant.activeStock?.quantity || 0) / variant.maxStock) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Min/Max Stock Information */}
          {(variant.minStock !== undefined || variant.maxStock !== undefined) && (
            <div className="flex items-center gap-4 text-sm">
              {variant.minStock !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Min Stock:</span>
                  <span className="text-foreground font-medium">{variant.minStock}</span>
                </div>
              )}
              {variant.maxStock !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Max Stock:</span>
                  <span className="text-foreground font-medium">{variant.maxStock}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  // Render variant list item (for list view)
  const renderVariantListItem = (variant: CompanyProductVariant) => (
    <Card 
      key={variant.id} 
      className={`p-4 transition-all duration-200 hover:shadow-md ${
        selectedVariantId === variant.id 
          ? 'ring-2 ring-[var(--accent-primary)] bg-[var(--accent-bg)] border-[var(--accent-primary)]/30' 
          : variant.isDefault
          ? 'border-0 border-2 border-[var(--accent-primary)]'
          : 'border bg-card hover:bg-accent/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-foreground leading-tight">{variant.name}</h4>
              {variant.isDefault && (
                <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Default
                </Badge>
              )}
              <Badge className={variant.isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                {variant.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {variant.sku && (
              <p className="text-xs text-muted-foreground mb-1">SKU: {variant.sku}</p>
            )}
            <div className="flex items-center gap-4 text-sm mt-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Stock:</span>
                <span className="text-[var(--accent-primary)] font-semibold">{variant.activeStock?.quantity || 0}</span>
              </div>
              {variant.minStock !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Min:</span>
                  <span className="text-foreground">{variant.minStock}</span>
                </div>
              )}
              {variant.maxStock !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Max:</span>
                  <span className="text-foreground">{variant.maxStock}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-accent text-muted-foreground hover:text-foreground ml-2">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-popover border-border" align="end">
            {!variant.isDefault && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSetAsDefault(variant); }} className="text-popover-foreground hover:bg-sidebar-accent">
                <Star className="w-4 h-4 mr-2" />
                Set as Default
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewStockDetails(variant); }} className="text-popover-foreground hover:bg-sidebar-accent">
              <Warehouse className="w-4 h-4 mr-2" />
              Stock Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewVariant(variant); }} className="text-popover-foreground hover:bg-sidebar-accent">
              <Eye className="w-4 h-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditVariant(variant); }} className="text-popover-foreground hover:bg-sidebar-accent">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteClick(variant); }} className="text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Product Variants</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage product variants. Pricing and stock are managed in the Stock Details page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredVariants.length} of {variants?.length || 0} variant{(variants?.length || 0) !== 1 ? 's' : ''}
          </Badge>
          <Button
            size="sm"
            onClick={handleAddVariant}
            className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)]"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Variant
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      {variants && variants.length > 0 && (
        <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <div className="space-y-4">
            <SearchInput
              placeholder="Search variants by name or SKU..."
              value={searchTerm}
              onChange={setSearchTerm}
            />

            {/* Filter Button and View Switcher */}
            <div className="flex items-center justify-end gap-3 flex-wrap">
              {/* Filter Button */}
              <Button 
                variant="outline" 
                onClick={() => setIsFilterPanelOpen(true)}
                className={cn(
                  "h-9",
                  (searchTerm || filterStatus !== "all" || filterDefault !== "all")
                    ? "bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent-text)] hover:bg-[var(--accent-primary)] hover:border-[var(--accent-primary)]"
                    : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
                )}
              >
                <Filter className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Filter</span>
              </Button>

              {/* View Switcher */}
              <ViewSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          </div>
        </Card>
      )}

      {/* Variants List/Grid */}
      {variantsLoading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredVariants && filteredVariants.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVariants.map((variant) => renderVariantCard(variant))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVariants.map((variant) => renderVariantListItem(variant))}
            </div>
          )}
        </>
      ) : variants && variants.length > 0 ? (
        <Card className="p-12 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium text-foreground mb-2">No Variants Match Your Filters</h4>
          <p className="text-muted-foreground text-sm mb-4">
            Try adjusting your search or filter criteria.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("all");
              setFilterDefault("all");
            }}
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <Card className="p-12 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium text-foreground mb-2">No Variants Available</h4>
          <p className="text-muted-foreground text-sm">This product doesn't have any variants configured.</p>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          if (variantToDelete) {
            onDeleteVariant(variantToDelete.id);
            setDeleteDialogOpen(false);
            setVariantToDelete(null);
          }
        }}
        itemType="Variant"
        itemName={variantToDelete?.name}
        description={`Are you sure you want to delete "${variantToDelete?.name}"? This action cannot be undone.`}
      />

      {/* Variant Dialog */}
      <VariantDialog
        open={variantDialogOpen}
        onOpenChange={setVariantDialogOpen}
        mode={variantDialogMode}
        variant={variantDialogVariant}
        systemProductId={systemProductId}
        onSave={handleSaveVariantWrapper}
        onCancel={() => {
          setVariantDialogVariant(null);
        }}
      />

      {/* Filter Right Panel */}
      <RightPanel
        open={isFilterPanelOpen}
        onOpenChange={setIsFilterPanelOpen}
        title="Filters"
        contentClassName="bg-background"
      >
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <Select value={filterStatus} onValueChange={(value: "all" | "active" | "inactive") => setFilterStatus(value)}>
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

          {/* Default Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Default Variant</label>
            <Select value={filterDefault} onValueChange={(value: "all" | "default" | "non-default") => setFilterDefault(value)}>
              <SelectTrigger className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                <SelectValue placeholder="All Variants" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Variants</SelectItem>
                <SelectItem value="default">Default Only</SelectItem>
                <SelectItem value="non-default">Non-Default Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Results Count */}
          {(searchTerm || filterStatus !== "all" || filterDefault !== "all") && (
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Results</span>
                <Badge variant="outline" className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                  {filteredVariants.length} variant{filteredVariants.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterDefault("all");
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
