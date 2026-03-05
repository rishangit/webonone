import { useState, useEffect, useMemo } from "react";
import { Filter, DollarSign, Package, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { SearchInput } from "../../../components/common/SearchInput";
import { Pagination } from "../../../components/common/Pagination";
import { EmptyState } from "../../../components/common/EmptyState";
import { CustomDialog } from "../../../components/ui/custom-dialog";
import { cn } from "../../../components/ui/utils";
import { toast } from "sonner";
import { isRole, UserRole } from "../../../types/user";
import { POSSalesPage } from "../POSSalesPage";
import { companySalesService } from "../../../services/companySales";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchAppointmentHistoryRequest } from "../../../store/slices/appointmentHistorySlice";
import { useSalesData } from "./hooks/useSalesData";
import { SalesStats, SalesCard, ProductSaleCard, SalesFilters } from "./components";
import { SaleData, ProductSale } from "./types";

export const SalesPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const companyId = user?.companyId;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("7days");
  const [activeTab, setActiveTab] = useState<"sales" | "products">("sales");
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
    error,
    pagination,
    formatCurrency,
    salesWithItems,
    setSalesWithItems,
    refreshSales
  } = useSalesData(companyId, dateRange, searchTerm, debouncedSearchTerm, currentPage, itemsPerPage);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter sales data
  const filteredSales = useMemo(() => {
    return salesData.filter(sale => {
      const matchesType = filterType === "all" || sale.type === filterType;
      const matchesStatus = filterStatus === "all" || sale.status === filterStatus;
      return matchesType && matchesStatus;
    });
  }, [salesData, filterType, filterStatus]);

  // Calculate totals
  const totalRevenue = useMemo(() => {
    const sum = filteredSales.reduce((acc, sale) => {
      const amount = typeof sale.totalAmount === 'string' 
        ? parseFloat(sale.totalAmount) || 0 
        : (sale.totalAmount || 0);
      return acc + (isNaN(amount) ? 0 : amount);
    }, 0);
    return isNaN(sum) ? 0 : sum;
  }, [filteredSales]);
  
  const appointmentRevenue = useMemo(() => {
    const sum = filteredSales
      .filter(s => s.type === 'appointment')
      .reduce((acc, sale) => {
        const amount = typeof sale.totalAmount === 'string' 
          ? parseFloat(sale.totalAmount) || 0 
          : (sale.totalAmount || 0);
        return acc + (isNaN(amount) ? 0 : amount);
      }, 0);
    return isNaN(sum) ? 0 : sum;
  }, [filteredSales]);
  
  const productRevenue = useMemo(() => {
    const sum = filteredSales
      .filter(s => s.type === 'product')
      .reduce((acc, sale) => {
        const amount = typeof sale.totalAmount === 'string' 
          ? parseFloat(sale.totalAmount) || 0 
          : (sale.totalAmount || 0);
        return acc + (isNaN(amount) ? 0 : amount);
      }, 0);
    return isNaN(sum) ? 0 : sum;
  }, [filteredSales]);
  
  const totalTransactions = filteredSales.length;

  // Calculate product sales statistics
  const productSales = useMemo(() => {
    const productMap = new Map<string, {
      name: string;
      category: string;
      totalSold: number;
      revenue: number;
      prices: number[];
      lastSold: string;
    }>();

    salesData.forEach((sale) => {
      sale.items.forEach((item) => {
        if (item.itemType === 'product') {
          const productKey = item.name;
          const existing = productMap.get(productKey);

          if (existing) {
            existing.totalSold += item.quantity || 1;
            existing.revenue += (item.unitPrice || 0) * (item.quantity || 1) * (1 - (item.discount || 0) / 100);
            existing.prices.push(item.unitPrice || 0);
            const itemDate = sale.date;
            if (itemDate > existing.lastSold) {
              existing.lastSold = itemDate;
            }
          } else {
            productMap.set(productKey, {
              name: item.name,
              category: 'Uncategorized',
              totalSold: item.quantity || 1,
              revenue: (item.unitPrice || 0) * (item.quantity || 1) * (1 - (item.discount || 0) / 100),
              prices: [item.unitPrice || 0],
              lastSold: sale.date
            });
          }
        }
      });
    });

    return Array.from(productMap.values()).map((product, index) => ({
      id: `PROD-${String(index + 1).padStart(3, '0')}`,
      name: product.name,
      category: product.category,
      totalSold: product.totalSold,
      revenue: product.revenue,
      averagePrice: product.prices.length > 0 
        ? product.prices.reduce((sum, p) => sum + p, 0) / product.prices.length 
        : 0,
      lastSold: product.lastSold,
      image: undefined
    } as ProductSale)).sort((a, b) => b.revenue - a.revenue);
  }, [salesData]);

  // Handle delete sale
  const handleDeleteSale = async (saleId: string) => {
    try {
      setIsDeleting(true);
      await companySalesService.deleteSale(saleId);
      toast.success("Sale deleted successfully");
      
      // Refresh sales list
      if (refreshSales) {
        await refreshSales();
      }
      
      setShowDeleteSaleDialog(false);
      setDeletingSaleId(null);
    } catch (error: any) {
      console.error('Error deleting sale:', error);
      toast.error(error.message || "Failed to delete sale");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete sale item
  const handleDeleteSaleItem = async (saleId: string, itemId: string) => {
    try {
      setIsDeleting(true);
      await companySalesService.deleteSaleItem(saleId, itemId);
      toast.success("Item removed from sale");
      
      // Clear the cached sale data
      setSalesWithItems(prev => {
        const updated = { ...prev };
        delete updated[saleId];
        return updated;
      });
      
      // Refresh sales list
      if (refreshSales) {
        await refreshSales();
      }
      
      setShowDeleteItemDialog(false);
      setDeletingItemId(null);
    } catch (error: any) {
      console.error('Error deleting sale item:', error);
      toast.error(error.message || "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };


  // Show POS page if enabled
  if (showPOS) {
    return <POSSalesPage onBack={() => setShowPOS(false)} currentUser={user} />;
  }

  return (
    <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Sales Overview</h1>
          <p className="text-muted-foreground mt-1">Track your revenue from appointments and product sales</p>
        </div>
        {isCompanyOwner && (
          <Button 
            variant="accent"
            onClick={() => setShowPOS(true)}
          >
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
            <div className="flex bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-1">
              <Button
                variant={activeTab === "sales" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("sales")}
                className={activeTab === "sales" 
                  ? "bg-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
                }
              >
                Sales History
              </Button>
              <Button
                variant={activeTab === "products" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("products")}
                className={activeTab === "products" 
                  ? "bg-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
                }
              >
                Product Performance
              </Button>
            </div>

            <Button 
              variant="outline" 
              onClick={() => setIsFilterPanelOpen(true)}
              className={cn(
                "h-9",
                (debouncedSearchTerm || (activeTab === "sales" && (filterType !== "all" || filterStatus !== "all")))
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
          {activeTab === "sales" ? (
            <div className="flex flex-col flex-1 min-h-0">
              {loading && filteredSales.length === 0 ? (
                <div className="flex-1">
                  <div className="space-y-4">
                    {[...Array(6)].map((_, index) => (
                      <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : filteredSales.length === 0 ? (
                <EmptyState
                  icon={DollarSign}
                  title="No Sales Found"
                  description={
                    debouncedSearchTerm || filterType !== "all" || filterStatus !== "all"
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
                    {filteredSales.map((sale) => (
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
          ) : (
            <Card className="bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-sm">
              <div className="p-4 border-b border-[var(--glass-border)]">
                <h3 className="font-medium text-foreground">Product Performance</h3>
                <p className="text-sm text-muted-foreground">Track your best-selling products and revenue</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productSales.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="font-medium text-foreground mb-2">No Product Sales</h3>
                      <p className="text-muted-foreground">
                        No product sales found in the selected date range.
                      </p>
                    </div>
                  ) : (
                    productSales.map((product) => (
                      <ProductSaleCard
                        key={product.id}
                        product={product}
                        formatCurrency={formatCurrency}
                      />
                    ))
                  )}
                </div>
              </div>
            </Card>
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
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        activeTab={activeTab}
        hasActiveFilters={!!(debouncedSearchTerm || (activeTab === "sales" && (filterType !== "all" || filterStatus !== "all")))}
        resultsCount={filteredSales.length}
        onClearFilters={() => {
          setSearchTerm("");
          setDebouncedSearchTerm("");
          setFilterType("all");
          setFilterStatus("all");
          setCurrentPage(1);
        }}
      />
    </div>
  );
};
