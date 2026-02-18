import { useState, useEffect } from "react";
import { Plus, Trash2, Package, Star, MoreVertical } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { SearchInput } from "../../../components/common/SearchInput";
import { Checkbox } from "../../../components/ui/checkbox";
import { systemProductAttributesService, SystemProductAttribute } from "../../../services/systemProductAttributes";
import { productRelatedAttributesService, ProductRelatedAttribute } from "../../../services/productRelatedAttributes";
import { unitsOfMeasureService, UnitsOfMeasure } from "../../../services/unitsOfMeasure";
import { toast } from "sonner";
import { CustomDialog } from "../../../components/ui/custom-dialog";
import { Label } from "../../../components/ui/label";
import { ViewSwitcher } from "../../../components/ui/view-switcher";
import { Pagination } from "../../../components/common/Pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";

interface ProductAttributesTabProps {
  productId: string;
}

export const ProductAttributesTab = ({ productId }: ProductAttributesTabProps) => {
  const [availableAttributes, setAvailableAttributes] = useState<SystemProductAttribute[]>([]);
  const [productAttributes, setProductAttributes] = useState<ProductRelatedAttribute[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitsOfMeasure[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Fetch available system attributes and units of measure
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attributesResult, unitsResult] = await Promise.all([
          systemProductAttributesService.getAttributes({
            isActive: true,
            limit: 1000,
          }),
          unitsOfMeasureService.getActiveUnits(),
        ]);
        setAvailableAttributes(attributesResult.attributes);
        setUnitsOfMeasure(unitsResult);
      } catch (error: any) {
        console.error("Error fetching available attributes or units:", error);
        toast.error(error.message || "Failed to load available attributes");
      }
    };
    fetchData();
  }, []);

  // Fetch product-related attributes
  useEffect(() => {
    if (productId) {
      fetchProductAttributes();
    }
  }, [productId]);

  const fetchProductAttributes = async () => {
    setLoading(true);
    try {
      const attributes = await productRelatedAttributesService.getAttributesByProductId(productId);
      setProductAttributes(attributes);
    } catch (error: any) {
      console.error("Error fetching product attributes:", error);
      toast.error(error.message || "Failed to load product attributes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttribute = () => {
    setSelectedAttributeId(null);
    setIsAddDialogOpen(true);
  };

  const handleSaveAttribute = async () => {
    if (selectedAttributeId) {
      // Add new attribute
      try {
        await productRelatedAttributesService.createAttribute({
          productId,
          attributeId: selectedAttributeId,
        });
        toast.success("Attribute added successfully");
        setIsAddDialogOpen(false);
        setSelectedAttributeId(null);
        setSearchTerm("");
        fetchProductAttributes();
      } catch (error: any) {
        toast.error(error.message || "Failed to add attribute");
      }
    }
  };

  const handleDeleteAttribute = async (id: string) => {
    if (!confirm("Are you sure you want to remove this attribute from the product?")) {
      return;
    }

    try {
      await productRelatedAttributesService.deleteAttribute(id);
      toast.success("Attribute removed successfully");
      fetchProductAttributes();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove attribute");
    }
  };

  const handleToggleVariantDefining = async (productAttr: ProductRelatedAttribute) => {
    try {
      await productRelatedAttributesService.updateAttribute(productAttr.id, {
        isVariantDefining: !productAttr.isVariantDefining
      });
      toast.success(`Attribute ${!productAttr.isVariantDefining ? 'marked as' : 'unmarked from'} variant-defining`);
      fetchProductAttributes();
    } catch (error: any) {
      toast.error(error.message || "Failed to update attribute");
    }
  };

  // Filter available attributes (exclude already added ones)
  const addedAttributeIds = new Set(productAttributes.map(pa => pa.attributeId));
  const filteredAvailableAttributes = availableAttributes.filter(
    attr => !addedAttributeIds.has(attr.id) && 
    attr.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter and paginate product attributes
  const filteredProductAttributes = productAttributes.filter((productAttr) => {
    const systemAttr = availableAttributes.find(a => a.id === productAttr.attributeId);
    if (!systemAttr) return false;
    return systemAttr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           systemAttr.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination calculations
  const totalItems = filteredProductAttributes.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAttributes = filteredProductAttributes.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  // Render attribute card
  const renderAttributeCard = (productAttr: ProductRelatedAttribute) => {
    const systemAttr = availableAttributes.find(a => a.id === productAttr.attributeId);
    if (!systemAttr) return null;

    return (
      <Card key={productAttr.id} className={`p-6 backdrop-blur-xl border-[var(--glass-border)] transition-all duration-200 hover:border-[var(--accent-border)] ${
        productAttr.isVariantDefining 
          ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/50" 
          : "bg-[var(--glass-bg)] hover:bg-[var(--glass-bg)]/80"
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground">{systemAttr.name}</h4>
              {productAttr.isVariantDefining && (
                <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs">
                  <Star className="w-3 h-3 mr-1 fill-current" /> Variant-Defining
                </Badge>
              )}
            </div>
            {systemAttr.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{systemAttr.description}</p>
            )}
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs border-[var(--glass-border)]">{systemAttr.valueDataType}</Badge>
              {systemAttr.unitOfMeasure && (() => {
                const unit = unitsOfMeasure.find(u => u.id === systemAttr.unitOfMeasure);
                return (
                  <Badge variant="outline" className="text-xs border-[var(--glass-border)]">
                    {unit ? unit.symbol : systemAttr.unitOfMeasure}
                  </Badge>
                );
              })()}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Checkbox
                id={`variant-defining-${productAttr.id}`}
                checked={productAttr.isVariantDefining}
                onCheckedChange={() => handleToggleVariantDefining(productAttr)}
                className="mr-2"
              />
              <Label 
                htmlFor={`variant-defining-${productAttr.id}`}
                className="text-sm text-foreground cursor-pointer"
              >
                Use as variant-defining attribute
              </Label>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem
                onClick={() => handleToggleVariantDefining(productAttr)}
                className="text-foreground hover:bg-accent"
              >
                <Star className="w-4 h-4 mr-2" />
                {productAttr.isVariantDefining ? "Unmark as Variant-Defining" : "Mark as Variant-Defining"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteAttribute(productAttr.id)}
                className="text-red-600 dark:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Attribute
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  };

  // Render attribute list item
  const renderAttributeListItem = (productAttr: ProductRelatedAttribute) => {
    const systemAttr = availableAttributes.find(a => a.id === productAttr.attributeId);
    if (!systemAttr) return null;

    const unit = systemAttr.unitOfMeasure 
      ? unitsOfMeasure.find(u => u.id === systemAttr.unitOfMeasure)
      : null;

    return (
      <Card key={productAttr.id} className={`p-4 backdrop-blur-xl border-[var(--glass-border)] transition-all duration-200 hover:border-[var(--accent-border)] ${
        productAttr.isVariantDefining 
          ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/50" 
          : "bg-[var(--glass-bg)] hover:bg-[var(--glass-bg)]/80"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground">{systemAttr.name}</h4>
                {productAttr.isVariantDefining && (
                  <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs">
                    <Star className="w-3 h-3 mr-1 fill-current" /> Variant-Defining
                  </Badge>
                )}
              </div>
              {systemAttr.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">{systemAttr.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs border-[var(--glass-border)]">{systemAttr.valueDataType}</Badge>
              {unit && (
                <Badge variant="outline" className="text-xs border-[var(--glass-border)]">
                  {unit.symbol}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Checkbox
                id={`variant-defining-list-${productAttr.id}`}
                checked={productAttr.isVariantDefining}
                onCheckedChange={() => handleToggleVariantDefining(productAttr)}
              />
              <Label 
                htmlFor={`variant-defining-list-${productAttr.id}`}
                className="text-sm text-foreground cursor-pointer whitespace-nowrap"
              >
                Variant-Defining
              </Label>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/50 ml-2"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem
                onClick={() => handleToggleVariantDefining(productAttr)}
                className="text-foreground hover:bg-accent"
              >
                <Star className="w-4 h-4 mr-2" />
                {productAttr.isVariantDefining ? "Unmark as Variant-Defining" : "Mark as Variant-Defining"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteAttribute(productAttr.id)}
                className="text-red-600 dark:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Attribute
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Product Attributes</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage attributes for this product from the global system attributes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />
          <Button
            onClick={handleAddAttribute}
            className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Attribute
          </Button>
        </div>
      </div>

      {/* Search */}
      {productAttributes.length > 0 && (
        <div className="max-w-md">
          <SearchInput
            placeholder="Search attributes..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-pulse text-muted-foreground">Loading attributes...</div>
        </div>
      ) : paginatedAttributes.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedAttributes.map((productAttr) => renderAttributeCard(productAttr))}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedAttributes.map((productAttr) => renderAttributeListItem(productAttr))}
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
          <h4 className="font-medium text-foreground mb-2">No Attributes Assigned</h4>
          <p className="text-muted-foreground text-sm mb-4">
            Add attributes from the global system attributes to this product.
          </p>
          <Button
            onClick={handleAddAttribute}
            className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Attribute
          </Button>
        </Card>
      )}

      {/* Add/Edit Attribute Dialog */}
      <CustomDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setSelectedAttributeId(null);
            setSearchTerm("");
          }
        }}
        title="Add Product Attribute"
        maxWidth="max-w-md"
      >
        <div className="space-y-3">
          <div>
            <Label className="text-foreground mb-1.5 text-sm">Select Attribute</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Select an attribute from the global system attributes to add to this product.
            </p>
            <div className="mb-2">
              <SearchInput
                placeholder="Search attributes..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar border border-[var(--glass-border)] rounded-md bg-[var(--glass-bg)]">
              {filteredAvailableAttributes.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredAvailableAttributes.map((attr) => {
                    const unit = attr.unitOfMeasure 
                      ? unitsOfMeasure.find(u => u.id === attr.unitOfMeasure)
                      : null;
                    
                    return (
                      <div
                        key={attr.id}
                        onClick={() => setSelectedAttributeId(attr.id)}
                        className={`p-2.5 rounded-md cursor-pointer transition-colors ${
                          selectedAttributeId === attr.id
                            ? "bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]"
                            : "hover:bg-accent border border-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm">{attr.name}</p>
                            {attr.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {attr.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant="outline" className="text-xs">{attr.valueDataType}</Badge>
                              {unit && (
                                <Badge variant="outline" className="text-xs">
                                  {unit.symbol}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  {searchTerm ? "No attributes found" : "All available attributes have been added"}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--glass-border)]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddDialogOpen(false);
                setSelectedAttributeId(null);
                setSearchTerm("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAttribute}
              disabled={!selectedAttributeId}
              className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)]"
            >
              Add
            </Button>
          </div>
        </div>
      </CustomDialog>
    </div>
  );
};
