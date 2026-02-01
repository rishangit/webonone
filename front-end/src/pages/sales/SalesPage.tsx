import { useState, useEffect, useMemo } from "react";
import { Filter, Calendar, TrendingUp, DollarSign, Package, Users, FileText, MoreVertical, Eye, RefreshCw, Clock, CreditCard, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { SearchInput } from "../../components/common/SearchInput";
import { Pagination } from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";
import { useIsMobile } from "../../components/ui/use-mobile";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAppointmentHistoryRequest } from "../../store/slices/appointmentHistorySlice";
import { fetchStaffRequest } from "../../store/slices/staffSlice";
import { formatAvatarUrl } from "../../utils";
import { DateDisplay } from "../../components/common/DateDisplay";
import { toast } from "sonner";
import { isRole, UserRole } from "../../types/user";
import { POSSalesPage } from "./POSSalesPage";
import { companySalesService } from "../../services/companySales";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { currenciesService, Currency } from "../../services/currencies";

interface SaleItem {
  id?: string; // Item ID from company_sales_items table
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  itemType?: 'service' | 'product';
  serviceId?: string;
  productId?: string;
  variantId?: string;
}

interface SaleData {
  id: string;
  type: 'appointment' | 'product';
  date: string;
  customerName: string;
  customerImage?: string;
  items: SaleItem[];
  totalAmount: number;
  status: 'completed' | 'processing' | 'refunded';
  paymentMethod: string;
  staffMember?: string;
  notes?: string;
}

interface ProductSale {
  id: string;
  name: string;
  category: string;
  totalSold: number;
  revenue: number;
  averagePrice: number;
  lastSold: string;
  image?: string;
}

// Data will be fetched from Redux

export function SalesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { history, loading, error, pagination } = useAppSelector((state) => state.appointmentHistory);
  const { staff } = useAppSelector((state) => state.staff);
  const { user } = useAppSelector((state) => state.auth);
  const { companies, currentCompany } = useAppSelector((state) => state.companies);
  const companyId = user?.companyId;
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("7days");
  const [activeTab, setActiveTab] = useState<"sales" | "products">("sales");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showPOS, setShowPOS] = useState(false);
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<{ saleId: string; itemId: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSaleDialog, setShowDeleteSaleDialog] = useState(false);
  const [showDeleteItemDialog, setShowDeleteItemDialog] = useState(false);
  const isMobile = useIsMobile();

  const isCompanyOwner = isRole(user?.role, UserRole.COMPANY_OWNER);

  // Calculate date range for filtering
  const getDateRange = (range: string) => {
    const today = new Date();
    const dateTo = today.toISOString().split('T')[0];
    let dateFrom = '';

    switch (range) {
      case '7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        dateFrom = sevenDaysAgo.toISOString().split('T')[0];
        break;
      case '30days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
        break;
      case '90days':
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);
        dateFrom = ninetyDaysAgo.toISOString().split('T')[0];
        break;
      case 'year':
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        dateFrom = oneYearAgo.toISOString().split('T')[0];
        break;
      default:
        dateFrom = '';
    }

    return { dateFrom, dateTo };
  };

  // Fetch appointment history and staff on mount and when filters change
  useEffect(() => {
    if (companyId) {
      const { dateFrom, dateTo } = getDateRange(dateRange);
      const offset = (currentPage - 1) * itemsPerPage;
      dispatch(fetchAppointmentHistoryRequest({
        companyId,
        limit: itemsPerPage,
        offset,
        page: currentPage,
        search: debouncedSearchTerm,
        dateFrom,
        dateTo,
        enrich: true // Enrich with product/service details
      }));
      dispatch(fetchStaffRequest({ companyId }));
    }
  }, [dispatch, companyId, dateRange, currentPage, itemsPerPage, debouncedSearchTerm]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Fetch company currency
  useEffect(() => {
    const fetchCompanyCurrency = async () => {
      if (!companyId) {
        try {
          const currencies = await currenciesService.getCurrencies();
          const usdCurrency = currencies.find(c => c.name === 'USD');
          setCompanyCurrency(usdCurrency || null);
        } catch (error) {
          console.error('Error fetching default currency:', error);
          setCompanyCurrency(null);
        }
        return;
      }
      
      try {
        let company = companies.find(c => String(c.id) === String(companyId)) || currentCompany;
        
        if (!company || String(company.id) !== String(companyId)) {
          try {
            const { companiesService } = await import("../../services/companies");
            company = await companiesService.getCompanyById(String(companyId));
          } catch (fetchError) {
            console.error('Error fetching company:', fetchError);
          }
        }
        
        const currencyId = company?.currencyId;
        
        if (currencyId) {
          try {
            const currency = await currenciesService.getCurrency(currencyId);
            setCompanyCurrency(currency);
          } catch (currencyError) {
            console.error('Error fetching currency by ID:', currencyError);
            const currencies = await currenciesService.getCurrencies();
            const usdCurrency = currencies.find(c => c.name === 'USD');
            setCompanyCurrency(usdCurrency || null);
          }
        } else {
          try {
            const currencies = await currenciesService.getCurrencies();
            const usdCurrency = currencies.find(c => c.name === 'USD');
            setCompanyCurrency(usdCurrency || null);
          } catch (error) {
            console.error('Error fetching default currency:', error);
            setCompanyCurrency(null);
          }
        }
      } catch (error) {
        console.error('Error fetching company currency:', error);
        try {
          const currencies = await currenciesService.getCurrencies();
          const usdCurrency = currencies.find(c => c.name === 'USD');
          setCompanyCurrency(usdCurrency || null);
        } catch (fallbackError) {
          setCompanyCurrency(null);
        }
      }
    };
    
    fetchCompanyCurrency();
  }, [companyId, companies, currentCompany]);

  const formatCurrency = (amount: number) => {
    const numPrice = Number(amount) || 0;
    
    if (isNaN(numPrice)) {
      return companyCurrency ? `${companyCurrency.symbol} ${(0).toFixed(companyCurrency.decimals || 2)}` : '$ 0.00';
    }
    
    if (companyCurrency) {
      const decimals = companyCurrency.decimals || 2;
      const roundedPrice = Math.round(numPrice / companyCurrency.rounding) * companyCurrency.rounding;
      const formattedNumber = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(roundedPrice);
      return `${companyCurrency.symbol} ${formattedNumber}`;
    }
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(numPrice);
    return formatted.replace('$', '$ ');
  };

  // Use DateDisplay component for consistent date formatting
  // Removed local formatDate function - now using DateDisplay component

  // Fetch full sale data with item IDs
  const [salesWithItems, setSalesWithItems] = useState<Record<string, any>>({});
  
  useEffect(() => {
    const fetchSalesWithItems = async () => {
      if (!companyId || history.length === 0) return;
      
      const salesMap: Record<string, any> = {};
      for (const sale of history) {
        try {
          const fullSale = await companySalesService.getCompanySaleById(sale.id, true);
          salesMap[sale.id] = fullSale;
        } catch (error) {
          console.error(`Error fetching sale ${sale.id}:`, error);
        }
      }
      setSalesWithItems(salesMap);
    };
    
    fetchSalesWithItems();
  }, [history, companyId]);

  // Transform appointment history to SaleData format
  const salesData = useMemo(() => {
    if (!history || history.length === 0) return [];

    return history.map((item) => {
      const fullSale = salesWithItems[item.id];
      const items: SaleData['items'] = [];
      
      // Use full sale data if available (has item IDs), otherwise use history data
      if (fullSale) {
        // Add services as items with IDs
        if (fullSale.servicesUsed && Array.isArray(fullSale.servicesUsed)) {
          fullSale.servicesUsed.forEach((service: any, index: number) => {
            items.push({
              id: service.id || `service-${item.id}-${index}`, // Use item ID if available
              name: service.name || `Service-${service.serviceId || 'Unknown'}`,
              quantity: service.quantity || 1,
              unitPrice: service.unitPrice || 0,
              discount: service.discount || 0,
              itemType: 'service',
              serviceId: service.serviceId
            });
          });
        }

        // Add products as items with IDs
        if (fullSale.productsUsed && Array.isArray(fullSale.productsUsed)) {
          fullSale.productsUsed.forEach((product: any, index: number) => {
            items.push({
              id: product.id || `product-${item.id}-${index}`, // Use item ID if available
              name: product.name || `Product-${product.productId || 'Unknown'}`,
              quantity: product.quantity || 1,
              unitPrice: product.unitPrice || 0,
              discount: product.discount || 0,
              itemType: 'product',
              productId: product.productId,
              variantId: product.variantId
            });
          });
        }
      } else {
        // Fallback to history data (no item IDs)
        // Add services as items (using serviceId reference)
        if (item.servicesUsed && Array.isArray(item.servicesUsed)) {
          item.servicesUsed.forEach((service: any, index: number) => {
            items.push({
              id: `service-${item.id}-${index}`, // Temporary ID
              name: service.name || `Service-${service.serviceId || 'Unknown'}`,
              quantity: service.quantity || 1,
              unitPrice: service.unitPrice || 0,
              discount: service.discount || 0,
              itemType: 'service',
              serviceId: service.serviceId
            });
          });
        }

        // Add products as items (using productId/variantId reference)
        if (item.productsUsed && Array.isArray(item.productsUsed)) {
          item.productsUsed.forEach((product: any, index: number) => {
            items.push({
              id: `product-${item.id}-${index}`, // Temporary ID
              name: product.name || `Product-${product.productId || 'Unknown'}`,
              quantity: product.quantity || 1,
              unitPrice: product.unitPrice || 0,
              discount: product.discount || 0,
              itemType: 'product',
              productId: product.productId,
              variantId: product.variantId
            });
          });
        }
      }

      // Determine sale type: 
      // - If it has appointmentId, it's an appointment sale
      // - If it has services, it's an appointment sale
      // - Otherwise, it's a direct sale (product sale from POS)
      const hasAppointmentId = item.appointmentId && item.appointmentId !== null;
      const hasServices = item.servicesUsed && item.servicesUsed.length > 0;
      const saleType: 'appointment' | 'product' = (hasAppointmentId || hasServices) ? 'appointment' : 'product';

      // Status is always completed for sales (completionStatus removed)
      const status: 'completed' | 'processing' | 'refunded' = 'completed';

      // Get customer name
      const customerName = item.userName || 
        (item.userFirstName && item.userLastName 
          ? `${item.userFirstName} ${item.userLastName}` 
          : 'Unknown Customer');

      return {
        id: item.id, // Use sale id (direct sales don't have appointmentId)
        type: saleType,
        date: item.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        customerName,
        customerImage: item.userAvatar ? formatAvatarUrl(item.userAvatar) : undefined,
        items: items.length > 0 ? items : [
          {
            id: `default-${item.id}`,
            name: 'Service',
            quantity: 1,
            unitPrice: item.totalAmount || 0,
            discount: item.discountAmount || 0
          }
        ],
        totalAmount: (() => {
          const amount = fullSale?.totalAmount || item.totalAmount || 0;
          if (typeof amount === 'string') {
            const parsed = parseFloat(amount);
            return isNaN(parsed) ? 0 : parsed;
          }
          return isNaN(amount) ? 0 : amount;
        })(),
        status,
        paymentMethod: 'Credit Card', // Default - can be added to history table later
        staffMember: item.staffId ? (staff.find(s => s.id === item.staffId)?.name || `${staff.find(s => s.id === item.staffId)?.firstName || ''} ${staff.find(s => s.id === item.staffId)?.lastName || ''}`.trim() || undefined) : undefined,
        notes: undefined // completionNotes removed
      } as SaleData;
    });
  }, [history, staff, salesWithItems]);

  // Filter sales data - search is handled server-side, only apply client-side filters
  const filteredSales = useMemo(() => {
    return salesData.filter(sale => {
      // Search is handled server-side, so we don't filter by searchTerm here
      const matchesType = filterType === "all" || sale.type === filterType;
      const matchesStatus = filterStatus === "all" || sale.status === filterStatus;
      return matchesType && matchesStatus;
    });
  }, [salesData, filterType, filterStatus]);

  // Calculate totals - ensure proper number conversion and handle NaN
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

  // Handle delete sale
  const handleDeleteSale = async (saleId: string) => {
    try {
      setIsDeleting(true);
      await companySalesService.deleteSale(saleId);
      toast.success("Sale deleted successfully");
      
      // Refresh sales list
      if (companyId) {
        const { dateFrom, dateTo } = getDateRange(dateRange);
        dispatch(fetchAppointmentHistoryRequest({
          companyId,
          limit: 1000,
          dateFrom,
          dateTo,
          enrich: true
        }));
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
      
      // Refresh sales list
      if (companyId) {
        const { dateFrom, dateTo } = getDateRange(dateRange);
        dispatch(fetchAppointmentHistoryRequest({
          companyId,
          limit: 1000,
          dateFrom,
          dateTo,
          enrich: true
        }));
      }
      
      // Clear the cached sale data
      setSalesWithItems(prev => {
        const updated = { ...prev };
        delete updated[saleId];
        return updated;
      });
      
      setShowDeleteItemDialog(false);
      setDeletingItemId(null);
    } catch (error: any) {
      console.error('Error deleting sale item:', error);
      toast.error(error.message || "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

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

    history.forEach((item) => {
      if (item.productsUsed && Array.isArray(item.productsUsed)) {
        item.productsUsed.forEach((product: any) => {
          // Use productId as key if name is not available
          const productKey = product.name || `Product-${product.productId || 'Unknown'}`;
          const productName = product.name || `Product-${product.productId || 'Unknown'}`;
          const existing = productMap.get(productKey);

          if (existing) {
            existing.totalSold += product.quantity || 1;
            existing.revenue += (product.total || (product.unitPrice || 0) * (product.quantity || 1));
            existing.prices.push(product.unitPrice || 0);
            const itemDate = item.createdAt?.split('T')[0] || '';
            if (itemDate > existing.lastSold) {
              existing.lastSold = itemDate;
            }
          } else {
            productMap.set(productKey, {
              name: productName,
              category: product.category || 'Uncategorized',
              totalSold: product.quantity || 1,
              revenue: (product.unitPrice || 0) * (product.quantity || 1) * (1 - (product.discount || 0) / 100),
              prices: [product.unitPrice || 0],
              lastSold: item.createdAt?.split('T')[0] || ''
            });
          }
        });
      }
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
      image: undefined // Can be added if product images are available
    } as ProductSale)).sort((a, b) => b.revenue - a.revenue);
  }, [history]);

  // Show POS page if enabled
  if (showPOS) {
    return <POSSalesPage onBack={() => setShowPOS(false)} currentUser={user} />;
  }

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-foreground mb-1">Sales Overview</h1>
          <p className="text-muted-foreground">Track your revenue from appointments and product sales</p>
        </div>
        <div className="flex items-center gap-2">
          {isCompanyOwner && (
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25"
              onClick={() => setShowPOS(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Sale
            </Button>
          )}
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25"
            onClick={() => {
              if (companyId) {
                const { dateFrom, dateTo } = getDateRange(dateRange);
                dispatch(fetchAppointmentHistoryRequest({
                  companyId,
                  limit: 1000,
                  dateFrom,
                  dateTo
                }));
              }
            }}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-xl font-semibold text-foreground">{formatCurrency(totalRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-[var(--accent-text)]" />
          </div>
        </Card>

        <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Appointments</p>
              <p className="text-xl font-semibold text-foreground">{formatCurrency(appointmentRevenue)}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Products</p>
              <p className="text-xl font-semibold text-foreground">{formatCurrency(productRevenue)}</p>
            </div>
            <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </Card>

        <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Transactions</p>
              <p className="text-xl font-semibold text-foreground">{totalTransactions}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        <div className="space-y-4">
          {/* Search Bar */}
          <SearchInput
            placeholder="Search sales by customer name, email, phone, or sale ID..."
            value={searchTerm}
            onChange={setSearchTerm}
            onDebouncedChange={setDebouncedSearchTerm}
            debounceDelay={500}
          />
          
          {/* Tab Buttons and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {/* Tab Navigation */}
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
              
              {/* Filters */}
              {activeTab === "sales" && (
                <>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="appointment">Appointment Sales</SelectItem>
                      <SelectItem value="product">Direct Sales</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              {(debouncedSearchTerm || (activeTab === "sales" && (filterType !== "all" || filterStatus !== "all"))) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setDebouncedSearchTerm("");
                    setFilterType("all");
                    setFilterStatus("all");
                    setCurrentPage(1);
                  }}
                  className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Content Based on Active Tab */}
      {activeTab === "sales" ? (
        <div className="space-y-4">
          {loading && filteredSales.length === 0 ? (
            /* Skeleton for Sales List - Matching sales card structure */
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        </div>
                      </div>
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                          <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                          <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
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
            filteredSales.map((sale) => (
            <Card key={sale.id} className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
              <div className="flex items-start gap-4">
                {/* Customer Avatar */}
                <Avatar className="w-12 h-12 sm:w-16 sm:h-16 ring-2 ring-[var(--accent-border)] flex-shrink-0">
                  <AvatarImage src={sale.customerImage} />
                  <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
                    {sale.customerName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                {/* Sale Details */}
                <div className="flex-1 min-w-0">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground truncate">{sale.customerName}</h3>
                        <Badge 
                          variant="outline" 
                          className={sale.type === 'appointment' 
                            ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300' 
                            : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300'
                          }
                        >
                          {sale.type === 'appointment' ? 'Appointment' : 'Product Sale'}
                        </Badge>
                        <Badge 
                          className={sale.status === 'completed' 
                            ? 'bg-green-500/20 text-green-600 border-green-500/30' 
                            : sale.status === 'processing'
                            ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30'
                            : 'bg-red-500/20 text-red-600 border-red-500/30'
                          }
                        >
                          {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Sale ID: {sale.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span><DateDisplay date={sale.date} /></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          <span>{sale.paymentMethod}</span>
                        </div>
                        {sale.staffMember && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{sale.staffMember}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-[var(--accent-text)] mb-1">
                        {formatCurrency(sale.totalAmount)}
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          <DropdownMenuItem 
                            className="text-foreground hover:bg-accent"
                            onClick={() => navigate(`/system/sales/${sale.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {isCompanyOwner && (
                            <DropdownMenuItem 
                              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => {
                                setDeletingSaleId(sale.id);
                                setShowDeleteSaleDialog(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Sale
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-[var(--accent-text)]" />
                      Items ({sale.items.length})
                    </h4>
                    <div className="space-y-2">
                      {sale.items.map((item, index) => (
                        <div key={item.id || index} className="flex items-center justify-between py-2 border-b border-[var(--glass-border)] last:border-b-0 group">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} • Unit Price: {formatCurrency(item.unitPrice)}
                              {item.discount > 0 && (
                                <span className="text-green-600 ml-2">
                                  {item.discount}% discount applied
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              {item.discount > 0 ? (
                                <div>
                                  <p className="text-xs text-muted-foreground line-through">
                                    {formatCurrency(item.quantity * item.unitPrice)}
                                  </p>
                                  <p className="font-semibold text-foreground">
                                    {formatCurrency(item.quantity * item.unitPrice * (1 - item.discount / 100))}
                                  </p>
                                </div>
                              ) : (
                                <p className="font-semibold text-foreground">
                                  {formatCurrency(item.quantity * item.unitPrice)}
                                </p>
                              )}
                            </div>
                            {isCompanyOwner && item.id && !item.id.startsWith('service-') && !item.id.startsWith('product-') && !item.id.startsWith('default-') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeletingItemId({ saleId: sale.id, itemId: item.id! });
                                  setShowDeleteItemDialog(true);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer with Notes */}
                  {sale.notes && (
                    <div className="mt-3 p-3 bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <FileText className="w-4 h-4 inline mr-2" />
                        {sale.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
            ))
          )}

          {/* Pagination */}
          {pagination && pagination.total > 0 && (
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
                  <Card key={product.id} className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--accent-bg)] transition-colors">
                    <div className="flex items-start gap-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg border border-[var(--glass-border)]"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <div className="space-y-1 mt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Sold:</span>
                            <span className="text-foreground font-medium">{product.totalSold}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Revenue:</span>
                            <span className="text-[var(--accent-text)] font-medium">{formatCurrency(product.revenue)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Avg. Price:</span>
                            <span className="text-foreground">{formatCurrency(product.averagePrice)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Last Sold:</span>
                            <span className="text-foreground"><DateDisplay date={product.lastSold} /></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Delete Sale Confirmation Dialog */}
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

      {/* Delete Item Confirmation Dialog */}
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
    </div>
  );
}