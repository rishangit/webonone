import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/common/SearchInput";
import { EmptyState } from "@/components/common/EmptyState";
import { ViewSwitcher } from "@/components/ui/view-switcher";
import { Pagination } from "@/components/common/Pagination";
import {
  productRelatedAttributesService,
  ProductRelatedAttribute,
} from "@/features/products/services/productRelatedAttributes";
import { unitsOfMeasureService, UnitsOfMeasure } from "@/features/products/services/unitsOfMeasure";
import { toast } from "sonner";
import { CompanyProductAttributeCard } from "./CompanyProductAttributeCard";
import { CompanyProductAttributeListItem } from "./CompanyProductAttributeListItem";

interface CompanyProductAttributesTabProps {
  systemProductId: string | null | undefined;
}

export const CompanyProductAttributesTab = ({ systemProductId }: CompanyProductAttributesTabProps) => {
  const [productAttributes, setProductAttributes] = useState<ProductRelatedAttribute[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitsOfMeasure[]>([]);
  const [attributesLoading, setAttributesLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      if (!systemProductId) {
        setProductAttributes([]);
        return;
      }
      setAttributesLoading(true);
      try {
        const [attributes, units] = await Promise.all([
          productRelatedAttributesService.getAttributesByProductId(systemProductId),
          unitsOfMeasureService.getActiveUnits(),
        ]);
        if (cancelled) return;
        setProductAttributes(attributes);
        setUnitsOfMeasure(units);
      } catch (error: unknown) {
        if (cancelled) return;
        console.error("Error fetching product attributes:", error);
        const message =
          error instanceof Error ? error.message : "Failed to load product attributes";
        toast.error(message);
      } finally {
        if (!cancelled) setAttributesLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [systemProductId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const filteredAttributes = productAttributes.filter((attr) => {
    if (!debouncedSearchTerm) return true;
    const q = debouncedSearchTerm.toLowerCase();
    const name = (attr.attributeName ?? "").toLowerCase();
    const description = (attr.attributeDescription ?? "").toLowerCase();
    return name.includes(q) || description.includes(q);
  });

  const totalItems = filteredAttributes.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAttributes = filteredAttributes.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasActiveFilters = debouncedSearchTerm !== "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Product Attributes</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Attributes defined for this product on the linked system product
          </p>
        </div>
      </div>

      {!systemProductId ? (
        <EmptyState
          icon={Package}
          title="Custom product"
          description="This product is not linked to a system product, so no system attributes are available."
        />
      ) : (
        <>
          {productAttributes.length > 0 && (
            <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <div className="space-y-4">
                <SearchInput
                  placeholder="Search attributes..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
                <div className="flex items-center justify-end gap-3 flex-wrap">
                  <ViewSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />
                </div>
              </div>
            </Card>
          )}

          {attributesLoading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading attributes...</div>
            </div>
          ) : paginatedAttributes.length > 0 ? (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedAttributes.map((attr) => (
                    <CompanyProductAttributeCard
                      key={attr.id}
                      productAttr={attr}
                      unitsOfMeasure={unitsOfMeasure}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedAttributes.map((attr) => (
                    <CompanyProductAttributeListItem
                      key={attr.id}
                      productAttr={attr}
                      unitsOfMeasure={unitsOfMeasure}
                    />
                  ))}
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
              description="The linked system product does not have any attributes assigned yet."
            />
          ) : (
            <EmptyState
              icon={Package}
              title="No attributes match your search"
              description="Try a different search term or clear the filter."
              action={
                hasActiveFilters
                  ? {
                      label: "Clear search",
                      variant: "outline",
                      onClick: () => {
                        setSearchTerm("");
                        setDebouncedSearchTerm("");
                      },
                    }
                  : undefined
              }
            />
          )}
        </>
      )}
    </div>
  );
};
