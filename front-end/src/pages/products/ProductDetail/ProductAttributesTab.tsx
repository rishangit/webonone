import { useState, useEffect } from "react";
import { Plus, Trash2, Package, Star } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { SearchInput } from "../../../components/common/SearchInput";
import { Checkbox } from "../../../components/ui/checkbox";
import { systemProductAttributesService, SystemProductAttribute } from "../../../services/systemProductAttributes";
import { productRelatedAttributesService, ProductRelatedAttribute } from "../../../services/productRelatedAttributes";
import { toast } from "sonner";
import { CustomDialog } from "../../../components/ui/custom-dialog";
import { Label } from "../../../components/ui/label";

interface ProductAttributesTabProps {
  productId: string;
}

export const ProductAttributesTab = ({ productId }: ProductAttributesTabProps) => {
  const [availableAttributes, setAvailableAttributes] = useState<SystemProductAttribute[]>([]);
  const [productAttributes, setProductAttributes] = useState<ProductRelatedAttribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);

  // Fetch available system attributes
  useEffect(() => {
    const fetchAvailableAttributes = async () => {
      try {
        const { attributes } = await systemProductAttributesService.getAttributes({
          isActive: true,
          limit: 1000,
        });
        setAvailableAttributes(attributes);
      } catch (error: any) {
        console.error("Error fetching available attributes:", error);
        toast.error(error.message || "Failed to load available attributes");
      }
    };
    fetchAvailableAttributes();
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


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Product Attributes</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage attributes for this product from the global system attributes
          </p>
        </div>
        <Button
          onClick={handleAddAttribute}
          className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Attribute
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-pulse">Loading attributes...</div>
        </div>
      ) : productAttributes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productAttributes.map((productAttr) => {
            const systemAttr = availableAttributes.find(a => a.id === productAttr.attributeId);
            if (!systemAttr) return null;

            return (
              <Card key={productAttr.id} className={`p-6 backdrop-blur-xl border-[var(--glass-border)] ${
                productAttr.isVariantDefining 
                  ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/50" 
                  : "bg-[var(--glass-bg)]"
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{systemAttr.name}</h4>
                      {productAttr.isVariantDefining && (
                        <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs">
                          <Star className="w-3 h-3 mr-1 fill-current" /> Variant-Defining
                        </Badge>
                      )}
                    </div>
                    {systemAttr.description && (
                      <p className="text-sm text-muted-foreground mb-3">{systemAttr.description}</p>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">{systemAttr.valueDataType}</Badge>
                      {systemAttr.unitOfMeasure && (
                        <Badge variant="outline" className="text-xs">
                          Unit: {systemAttr.unitOfMeasure}
                        </Badge>
                      )}
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAttribute(productAttr.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
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
      >
        <div className="space-y-4">
          <div>
            <Label className="text-foreground mb-2">Select Attribute</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select an attribute from the global system attributes to add to this product.
            </p>
            <div className="mb-2">
              <SearchInput
                placeholder="Search attributes..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            <div className="max-h-60 overflow-y-auto border border-[var(--glass-border)] rounded-md">
              {filteredAvailableAttributes.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredAvailableAttributes.map((attr) => (
                    <div
                      key={attr.id}
                      onClick={() => setSelectedAttributeId(attr.id)}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedAttributeId === attr.id
                          ? "bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]"
                          : "hover:bg-accent border border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{attr.name}</p>
                          {attr.description && (
                            <p className="text-sm text-muted-foreground mt-1">{attr.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{attr.valueDataType}</Badge>
                            {attr.unitOfMeasure && (
                              <Badge variant="outline" className="text-xs">
                                Unit: {attr.unitOfMeasure}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  {searchTerm ? "No attributes found" : "All available attributes have been added"}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setSelectedAttributeId(null);
                setSearchTerm("");
              }}
            >
              Cancel
            </Button>
            <Button
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
