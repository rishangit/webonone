import { useState, useEffect } from "react";
import { Plus, Package, Filter } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { SearchInput } from "../../../../components/common/SearchInput";
import { ViewSwitcher } from "../../../../components/ui/view-switcher";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { RightPanel } from "../../../../components/common/RightPanel";
import { cn } from "../../../../components/ui/utils";
import { ProductVariantCard } from "./ProductVariantCard";
import { ProductVariant as SystemProductVariant } from "../../../../services/productVariants";

interface LegacyProductVariant {
  id: string;
  name: string;
  description?: string;
  sku: string;
  isActive: boolean;
  color?: string;
  size?: string;
  weight?: string;
  dimensions?: string;
  material?: string;
  notes?: string;
}

interface ProductVariantListProps {
  productType: "system" | "company";
  systemVariants: SystemProductVariant[];
  companyVariants?: LegacyProductVariant[];
  variantsLoading: boolean;
  selectedVariantId: string | null;
  isSuperAdmin?: boolean;
  onVariantSelect: (variant: SystemProductVariant | LegacyProductVariant | null) => void;
  onAddVariant: () => void;
  onEditVariant?: (variant: SystemProductVariant | LegacyProductVariant) => void;
  onDeleteVariant?: (variantId: string) => void;
  onToggleVariantStatus?: (variant: SystemProductVariant) => void;
  onToggleVariantVerification?: (variant: SystemProductVariant) => void;
  onSetDefaultVariant?: (variant: SystemProductVariant) => void;
  onUpdateVariant?: (variantId: string, updates: Partial<LegacyProductVariant>) => void;
}

export const ProductVariantList = ({
  productType,
  systemVariants,
  companyVariants = [],
  variantsLoading,
  selectedVariantId,
  isSuperAdmin = false,
  onVariantSelect,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
  onToggleVariantStatus,
  onToggleVariantVerification,
  onSetDefaultVariant,
  onUpdateVariant,
}: ProductVariantListProps) => {
  const variants = productType === "system" ? systemVariants : (companyVariants || []);
  const variantCount = variants.length;

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterDefault, setFilterDefault] = useState<"all" | "default" | "non-default">("all");
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "pending">("all");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Filter variants based on search term and filters
  const filteredVariants = variants.filter((variant) => {
    const isSystemVariant = productType === "system";
    const systemVariant = variant as SystemProductVariant;
    const legacyVariant = variant as LegacyProductVariant;

    // Search filter
    const matchesSearch = 
      variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variant.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (legacyVariant.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    // Status filter
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "active" && variant.isActive) ||
      (filterStatus === "inactive" && !variant.isActive);

    // Default filter (only for system variants)
    const matchesDefault = 
      !isSystemVariant ||
      filterDefault === "all" ||
      (filterDefault === "default" && systemVariant.isDefault) ||
      (filterDefault === "non-default" && !systemVariant.isDefault);

    // Verified filter (only for system variants)
    const matchesVerified = 
      !isSystemVariant ||
      filterVerified === "all" ||
      (filterVerified === "verified" && systemVariant.isVerified) ||
      (filterVerified === "pending" && !systemVariant.isVerified);

    return matchesSearch && matchesStatus && matchesDefault && matchesVerified;
  });

  // Reset search when variants change
  useEffect(() => {
    if (variants.length === 0) {
      setSearchTerm("");
    }
  }, [variants.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Product Variants</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage product variants for this {productType === "system" ? "system" : "company"} product.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredVariants.length} of {variantCount} variant{variantCount !== 1 ? 's' : ''}
          </Badge>
          <Button
            size="sm"
            onClick={onAddVariant}
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
              placeholder="Search variants by name, SKU, or description..."
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
                  (searchTerm || filterStatus !== "all" || filterDefault !== "all" || (productType === "system" && filterVerified !== "all"))
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
          <div className="animate-pulse text-muted-foreground">Loading variants...</div>
        </div>
      ) : filteredVariants && filteredVariants.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVariants.map((variant) => (
                <ProductVariantCard
                  key={variant.id}
                  variant={variant}
                  isSelected={selectedVariantId === variant.id}
                  productType={productType}
                  isSuperAdmin={isSuperAdmin}
                  onSelect={() => onVariantSelect(selectedVariantId === variant.id ? null : variant)}
                  onEdit={onEditVariant}
                  onDelete={onDeleteVariant}
                  onToggleStatus={onToggleVariantStatus}
                  onToggleVerification={onToggleVariantVerification}
                  onSetDefault={onSetDefaultVariant}
                  onUpdate={onUpdateVariant}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVariants.map((variant) => (
                <ProductVariantCard
                  key={variant.id}
                  variant={variant}
                  isSelected={selectedVariantId === variant.id}
                  productType={productType}
                  isSuperAdmin={isSuperAdmin}
                  onSelect={() => onVariantSelect(selectedVariantId === variant.id ? null : variant)}
                  onEdit={onEditVariant}
                  onDelete={onDeleteVariant}
                  onToggleStatus={onToggleVariantStatus}
                  onToggleVerification={onToggleVariantVerification}
                  onSetDefault={onSetDefaultVariant}
                  onUpdate={onUpdateVariant}
                />
              ))}
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
              if (productType === "system") {
                setFilterVerified("all");
              }
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

          {/* Default Filter - Only for system variants */}
          {productType === "system" && (
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
          )}

          {/* Verified Filter - Only for system variants */}
          {productType === "system" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Verification Status</label>
              <Select value={filterVerified} onValueChange={(value: "all" | "verified" | "pending") => setFilterVerified(value)}>
                <SelectTrigger className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filter Results Count */}
          {(searchTerm || filterStatus !== "all" || filterDefault !== "all" || (productType === "system" && filterVerified !== "all")) && (
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
                  if (productType === "system") {
                    setFilterVerified("all");
                  }
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
