import { useState, useEffect } from "react";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import {
  systemProductAttributesService,
  SystemProductAttribute,
} from "@/features/products/services/systemProductAttributes";
import {
  productRelatedAttributesService,
  ProductRelatedAttribute,
} from "@/features/products/services/productRelatedAttributes";
import { unitsOfMeasureService, UnitsOfMeasure } from "@/features/products/services/unitsOfMeasure";
import { toast } from "sonner";
import { Pagination } from "@/components/common/Pagination";
import { ProductAttributeCard } from "./ProductAttributeCard";
import { ProductAttributeListItem } from "./ProductAttributeListItem";
import { ProductAttributesSearchCard } from "./ProductAttributesSearchCard";
import { AddProductAttributeDialog } from "./AddProductAttributeDialog";
import { SetProductAttributeVariantOptionsDialog } from "./SetProductAttributeVariantOptionsDialog";

interface ProductAttributesTabProps {
  productId: string;
}

export const ProductAttributesTab = ({ productId }: ProductAttributesTabProps) => {
  const [availableAttributes, setAvailableAttributes] = useState<SystemProductAttribute[]>([]);
  const [productAttributes, setProductAttributes] = useState<ProductRelatedAttribute[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitsOfMeasure[]>([]);
  const [loading, setLoading] = useState(false);
  const [listSearchTerm, setListSearchTerm] = useState("");
  const [pickerSearchTerm, setPickerSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [variantOptionsTarget, setVariantOptionsTarget] = useState<ProductRelatedAttribute | null>(null);

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
      } catch (error: unknown) {
        console.error("Error fetching available attributes or units:", error);
        const message = error instanceof Error ? error.message : "Failed to load available attributes";
        toast.error(message);
      }
    };
    fetchData();
  }, []);

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
    } catch (error: unknown) {
      console.error("Error fetching product attributes:", error);
      const message = error instanceof Error ? error.message : "Failed to load product attributes";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttribute = () => {
    setSelectedAttributeId(null);
    setPickerSearchTerm("");
    setIsAddDialogOpen(true);
  };

  const handleSaveAttribute = async () => {
    if (!selectedAttributeId) return;

    try {
      await productRelatedAttributesService.createAttribute({
        productId,
        attributeId: selectedAttributeId,
      });
      toast.success("Attribute added successfully");
      setIsAddDialogOpen(false);
      setSelectedAttributeId(null);
      setPickerSearchTerm("");
      fetchProductAttributes();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add attribute";
      toast.error(message);
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to remove attribute";
      toast.error(message);
    }
  };

  const handleToggleVariantDefining = async (productAttr: ProductRelatedAttribute) => {
    try {
      await productRelatedAttributesService.updateAttribute(productAttr.id, {
        isVariantDefining: !productAttr.isVariantDefining,
      });
      toast.success(
        `Attribute ${!productAttr.isVariantDefining ? "marked as" : "unmarked from"} variant-defining`,
      );
      fetchProductAttributes();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update attribute";
      toast.error(message);
    }
  };

  const addedAttributeIds = new Set(productAttributes.map((pa) => pa.attributeId));
  const filteredAvailableAttributes = availableAttributes.filter(
    (attr) =>
      !addedAttributeIds.has(attr.id) &&
      attr.name.toLowerCase().includes(pickerSearchTerm.toLowerCase()),
  );

  const filteredProductAttributes = productAttributes.filter((productAttr) => {
    const systemAttr = availableAttributes.find((a) => a.id === productAttr.attributeId);
    if (!systemAttr) return false;
    const q = listSearchTerm.toLowerCase();
    return (
      systemAttr.name.toLowerCase().includes(q) || systemAttr.description?.toLowerCase().includes(q)
    );
  });

  const totalItems = filteredProductAttributes.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAttributes = filteredProductAttributes.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [listSearchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
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

      {productAttributes.length > 0 && (
        <ProductAttributesSearchCard
          searchTerm={listSearchTerm}
          onSearchTermChange={setListSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-pulse text-muted-foreground">Loading attributes...</div>
        </div>
      ) : paginatedAttributes.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedAttributes.map((productAttr) => {
                const systemAttr = availableAttributes.find((a) => a.id === productAttr.attributeId);
                if (!systemAttr) return null;
                return (
                  <ProductAttributeCard
                    key={productAttr.id}
                    productAttr={productAttr}
                    systemAttr={systemAttr}
                    unitsOfMeasure={unitsOfMeasure}
                    onToggleVariantDefining={handleToggleVariantDefining}
                    onDelete={handleDeleteAttribute}
                    onSetValues={setVariantOptionsTarget}
                  />
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedAttributes.map((productAttr) => {
                const systemAttr = availableAttributes.find((a) => a.id === productAttr.attributeId);
                if (!systemAttr) return null;
                return (
                  <ProductAttributeListItem
                    key={productAttr.id}
                    productAttr={productAttr}
                    systemAttr={systemAttr}
                    unitsOfMeasure={unitsOfMeasure}
                    onToggleVariantDefining={handleToggleVariantDefining}
                    onDelete={handleDeleteAttribute}
                    onSetValues={setVariantOptionsTarget}
                  />
                );
              })}
            </div>
          )}

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
      ) : productAttributes.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No attributes assigned"
          description="Add attributes from the global system attributes to this product."
          action={{
            label: "Add attribute",
            variant: "accent",
            icon: Plus,
            onClick: handleAddAttribute,
          }}
        />
      ) : (
        <EmptyState
          icon={Package}
          title="No attributes match your search"
          description="Try a different search term or clear the filter."
          action={{
            label: "Clear search",
            variant: "outline",
            onClick: () => setListSearchTerm(""),
          }}
        />
      )}

      <AddProductAttributeDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setSelectedAttributeId(null);
            setPickerSearchTerm("");
          }
        }}
        attributes={filteredAvailableAttributes}
        unitsOfMeasure={unitsOfMeasure}
        pickerSearchTerm={pickerSearchTerm}
        onPickerSearchTermChange={setPickerSearchTerm}
        selectedAttributeId={selectedAttributeId}
        onSelectAttributeId={setSelectedAttributeId}
        onConfirmAdd={handleSaveAttribute}
      />

      <SetProductAttributeVariantOptionsDialog
        open={variantOptionsTarget !== null}
        onOpenChange={(open) => {
          if (!open) setVariantOptionsTarget(null);
        }}
        productRelatedAttribute={variantOptionsTarget}
        onSaved={fetchProductAttributes}
      />
    </div>
  );
};
