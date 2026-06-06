import { useState, useEffect } from "react";
import { Filter, DollarSign, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { cn } from "@/components/ui/utils";
import { toast } from "sonner";
import { isRole, UserRole } from "@/shared/types/user";
import { companySalesService } from "@/features/sales/services";
import { useAppSelector } from "@/store/hooks";
import { useSalesData } from "@/features/sales/hooks/useSalesData";
import { SalesStats, SalesCard, SalesFilters } from "@/features/sales/components";
import { POSSalesPage } from "./POSSalesPage";

export const SalesPage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const companyId = user?.companyId;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [filterType, setFilterType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [showPOS, setShowPOS] = useState(false);
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<{ saleId: string; itemId: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSaleDialog, setShowDeleteSaleDialog] = useState(false);
  const [showDeleteItemDialog, setShowDeleteItemDialog] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const isCompanyOwner = isRole(user?.role, UserRole.COMPANY_OWNER);

  const {
    salesData,
    loading,
    summary,
    summaryLoading,
    error,
    pagination,
    formatCurrency,
    setSalesWithItems,
    refreshSales
  } = useSalesData(
    companyId ?? undefined,
    dateRange,
    debouncedSearchTerm,
    currentPage,
    itemsPerPage,
    filterType
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterType, dateRange]);

  const handleDeleteSale = async (saleId: string) => {
    try {
      setIsDeleting(true);
      await companySalesService.deleteSale(saleId);
      toast.success("Sale deleted successfully");

      if (refreshSales) {
        await refreshSales();
      }

      setShowDeleteSaleDialog(false);
      setDeletingSaleId(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete sale";
      console.error('Error deleting sale:', err);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSaleItem = async (saleId: string, itemId: string) => {
    try {
      setIsDeleting(true);
      await companySalesService.deleteSaleItem(saleId, itemId);
      toast.success("Item removed from sale");

      setSalesWithItems(prev => {
        const updated = { ...prev };
        delete updated[saleId];
        return updated;
      });

      if (refreshSales) {
        await refreshSales();
      }

      setShowDeleteItemDialog(false);
      setDeletingItemId(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to remove item";
      console.error('Error deleting sale item:', err);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (showPOS) {
    return <POSSalesPage onBack={() => setShowPOS(false)} currentUser={user} />;
  }

  const totalRevenue = summary?.totalRevenue ?? 0;
  const appointmentRevenue = summary?.appointmentRevenue ?? 0;
  const productRevenue = summary?.productRevenue ?? 0;
  const totalTransactions = summary?.totalTransactions ?? 0;
  const resultsCount = pagination?.total ?? salesData.length;

  return (
    <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Sales History</h1>
          <p className="text-muted-foreground mt-1">
            All direct sales and completed appointment sales in one list
          </p>
        </div>
        {isCompanyOwner && (
          <Button variant="accent" onClick={() => setShowPOS(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Sale
          </Button>
        )}
      </div>

      <SalesStats
        totalRevenue={totalRevenue}
        appointmentRevenue={appointmentRevenue}
        productRevenue={productRevenue}
        totalTransactions={totalTransactions}
        formatCurrency={formatCurrency}
        loading={summaryLoading}
      />

      <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] mb-6">
        <div className="space-y-4">
          <SearchInput
            placeholder="Search sales by customer name, email, phone, or sale ID..."
            value={searchTerm}
            onChange={setSearchTerm}
            onDebouncedChange={setDebouncedSearchTerm}
            debounceDelay={500}
          />

          <div className="flex items-center justify-end gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setIsFilterPanelOpen(true)}
              className={cn(
                "h-9",
                debouncedSearchTerm || filterType !== "all" || dateRange !== "all"
                  ? "bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent-text)] hover:bg-[var(--accent-primary)] hover:border-[var(--accent-primary)]"
                  : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
              )}
            >
              <Filter className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-col flex-1 min-h-[calc(100vh-300px)]">
        <div className="flex flex-col flex-1 min-h-0">
          {loading && salesData.length === 0 ? (
            <div className="flex-1">
              <div className="space-y-4">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : salesData.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No Sales Found"
              description={
                debouncedSearchTerm || filterType !== "all" || dateRange !== "all"
                  ? "No sales match your current filters. Try adjusting your search criteria."
                  : "You haven't made any sales yet. Start by completing appointments or selling products."
              }
              action={
                isCompanyOwner
                  ? {
                      label: "Add Your First Sale",
                      onClick: () => setShowPOS(true),
                      variant: "accent",
                      icon: Plus,
                    }
                  : undefined
              }
            />
          ) : (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 space-y-4">
                {salesData.map((sale) => (
                  <SalesCard
                    key={sale.id}
                    sale={sale}
                    formatCurrency={formatCurrency}
                    onViewDetails={(saleId) => navigate(`/system/sales/${saleId}`)}
                    onDeleteSale={(saleId) => {
                      setDeletingSaleId(saleId);
                      setShowDeleteSaleDialog(true);
                    }}
                    onDeleteItem={handleDeleteSaleItem}
                    isCompanyOwner={isCompanyOwner}
                  />
                ))}
              </div>

              {pagination && pagination.total > 0 && (
                <div className="mt-auto pt-4">
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
            </div>
          )}
        </div>
      </div>

      <CustomDialog
        open={showDeleteSaleDialog}
        onOpenChange={setShowDeleteSaleDialog}
        title="Delete Sale"
        description="Are you sure you want to delete this sale? This action cannot be undone."
        icon={<Trash2 className="w-5 h-5 text-red-600" />}
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowDeleteSaleDialog(false);
              setDeletingSaleId(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deletingSaleId && handleDeleteSale(deletingSaleId)}
            disabled={isDeleting || !deletingSaleId}
          >
            {isDeleting ? "Deleting..." : "Delete Sale"}
          </Button>
        </div>
      </CustomDialog>

      <CustomDialog
        open={showDeleteItemDialog}
        onOpenChange={setShowDeleteItemDialog}
        title="Remove Item"
        description="Are you sure you want to remove this item from the sale? The sale total will be recalculated."
        icon={<Trash2 className="w-5 h-5 text-red-600" />}
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowDeleteItemDialog(false);
              setDeletingItemId(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deletingItemId && handleDeleteSaleItem(deletingItemId.saleId, deletingItemId.itemId)}
            disabled={isDeleting || !deletingItemId}
          >
            {isDeleting ? "Removing..." : "Remove Item"}
          </Button>
        </div>
      </CustomDialog>

      <SalesFilters
        open={isFilterPanelOpen}
        onOpenChange={setIsFilterPanelOpen}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        hasActiveFilters={!!(debouncedSearchTerm || filterType !== "all" || dateRange !== "all")}
        resultsCount={resultsCount}
        onClearFilters={() => {
          setSearchTerm("");
          setDebouncedSearchTerm("");
          setFilterType("all");
          setDateRange("all");
          setCurrentPage(1);
        }}
      />
    </div>
  );
};
