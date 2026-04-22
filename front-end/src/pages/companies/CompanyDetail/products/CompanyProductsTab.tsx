import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { ViewSwitcher } from "@/components/ui/view-switcher";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCompanyProductsRequest } from "@/store/slices/companyProductsSlice";
import { CompanyProductCard } from "../../../products/CompanyProducts";

interface CompanyProductsTabProps {
  companyId: string;
}

export const CompanyProductsTab = ({ companyId }: CompanyProductsTabProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { companyProducts, loading, pagination } = useAppSelector((state) => state.companyProducts);
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Fetch products for the company
  useEffect(() => {
    if (companyId) {
      const offset = (currentPage - 1) * itemsPerPage;
      dispatch(fetchCompanyProductsRequest({
        companyId,
        filters: {
          page: currentPage,
          limit: itemsPerPage,
          offset,
        }
      }));
    }
  }, [dispatch, companyId, currentPage, itemsPerPage]);

  // Filter products for this company
  // Note: Company detail page shows ALL products regardless of isAvailableForPurchase
  // This is an admin/company owner view for managing products
  const companyProductsList = useMemo(() => {
    return companyProducts.filter(product => String(product.companyId) === String(companyId));
  }, [companyProducts, companyId]);

  const handleViewProduct = (productId: string) => {
    navigate(`/system/companies/${companyId}/products/${productId}`);
  };

  const handleDeleteProduct = (productId: string) => {
    // Handle delete - could show a dialog
    console.log('Delete product:', productId);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)] mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Switcher */}
      <div className="flex items-center justify-end">
        <ViewSwitcher
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Products List */}
      {companyProductsList.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {companyProductsList.map((product) => (
                <CompanyProductCard
                  key={product.id}
                  product={product}
                  viewMode="grid"
                  onView={() => handleViewProduct(product.id)}
                  onDelete={() => handleDeleteProduct(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {companyProductsList.map((product) => (
                <CompanyProductCard
                  key={product.id}
                  product={product}
                  viewMode="list"
                  onView={() => handleViewProduct(product.id)}
                  onDelete={() => handleDeleteProduct(product.id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && (
            <div className="mt-6">
              <Pagination
                totalItems={pagination.total}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                showItemsPerPageSelector={true}
                itemsPerPageOptions={[12, 24, 48, 96]}
                onItemsPerPageChange={(newItemsPerPage) => {
                  setItemsPerPage(newItemsPerPage);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Package}
          title="No products found"
          description="This company hasn't added any products yet."
        />
      )}
    </div>
  );
};
