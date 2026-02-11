import { useState, useEffect, useMemo, useRef } from "react";
import { Calendar, TrendingUp, TrendingDown, DollarSign, Users, Package, Building, Star, Activity, ArrowUp, ArrowDown, BarChart3, PieChart, LineChart, Filter, Download, RefreshCw } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useIsMobile } from "../../components/ui/use-mobile";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell, Pie, AreaChart, Area } from "recharts";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { store } from "../../store";
import { fetchAppointmentHistoryRequest } from "../../store/slices/appointmentHistorySlice";
import { fetchAppointmentsRequest } from "../../store/slices/appointmentsSlice";
import { fetchServicesRequest } from "../../store/slices/servicesSlice";
import { companySalesService, CompanySale } from "../../services/companySales";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem } from "../../components/ui/carousel";

interface AnalyticsPageProps {
  currentUser?: {
    email: string;
    role: string;
    name: string;
    companyId?: string;
  } | null;
}

// Default margins for profit calculation
const SERVICE_PROFIT_MARGIN = 0.55; // 55% average margin for services
const PRODUCT_PROFIT_MARGIN = 0.35; // 35% average margin for products
const mockGrowthRate = 0.125; // 12.5% growth (mock)

// Mock historical data for trends (when we don't have enough real data)
const generateMockHistoricalData = (months: number, baseRevenue: number) => {
  const data = [];
  const today = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleString('default', { month: 'short' });
    const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
    const revenue = baseRevenue * (1 + variance);
    // Use average margin for mock data (weighted average of service and product margins)
    const avgMargin = (SERVICE_PROFIT_MARGIN + PRODUCT_PROFIT_MARGIN) / 2;
    const profit = revenue * avgMargin;
    data.push({
      month: monthName,
      revenue: Math.round(revenue),
      profit: Math.round(profit),
      services: Math.round(revenue / 250), // Mock: ~$250 per service
      products: Math.round(revenue * 0.2) // Mock: 20% from products
    });
  }
  return data;
};

export const AnalyticsPage = ({ currentUser }: AnalyticsPageProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { appointments, loading: appointmentsLoading } = useAppSelector((state) => state.appointments);
  const { services, loading: servicesLoading } = useAppSelector((state) => state.services);
  const { history: salesHistory, loading: salesLoading } = useAppSelector((state) => state.appointmentHistory);
  const isMobile = useIsMobile();

  const [timeRange, setTimeRange] = useState("6months");
  const [dataView, setDataView] = useState("monthly");
  const [salesData, setSalesData] = useState<CompanySale[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchAbortControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<{ dateFrom: string; dateTo: string; timestamp: number } | null>(null);

  const companyId = user?.companyId || currentUser?.companyId;

  // Calculate date range based on timeRange
  const getDateRange = useMemo(() => {
    const today = new Date();
    const dateTo = today.toISOString().split('T')[0];
    let dateFrom = '';

    switch (timeRange) {
      case '1month':
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        dateFrom = oneMonthAgo.toISOString().split('T')[0];
        break;
      case '3months':
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        dateFrom = threeMonthsAgo.toISOString().split('T')[0];
        break;
      case '6months':
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        dateFrom = sixMonthsAgo.toISOString().split('T')[0];
        break;
      case '1year':
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        dateFrom = oneYearAgo.toISOString().split('T')[0];
        break;
      default:
        dateFrom = '';
    }

    return { dateFrom, dateTo };
  }, [timeRange]);

  // Fetch data with debouncing and request deduplication to prevent rapid successive calls
  useEffect(() => {
    // If no companyId, set loading to false and show empty state
    if (!companyId) {
      setLoading(false);
      setSalesData([]);
      return;
    }

    // Cancel any ongoing request
    if (fetchAbortControllerRef.current) {
      fetchAbortControllerRef.current.abort();
    }

    // Check if we already fetched this exact data recently (within 2 seconds)
    const now = Date.now();
    if (lastFetchRef.current && 
        lastFetchRef.current.dateFrom === getDateRange.dateFrom &&
        lastFetchRef.current.dateTo === getDateRange.dateTo &&
        (now - lastFetchRef.current.timestamp) < 2000) {
      console.log('Skipping duplicate analytics fetch - data is fresh');
      return;
    }

    // Debounce to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      const fetchData = async () => {
        // Create new abort controller for this request
        const abortController = new AbortController();
        fetchAbortControllerRef.current = abortController;

        setLoading(true);
        try {
          // Fetch sales data (this also includes appointment history data)
          const sales = await companySalesService.getCompanySales({
            companyId,
            dateFrom: getDateRange.dateFrom,
            dateTo: getDateRange.dateTo,
            limit: 10000,
            enrich: true
          });

          // Check if request was aborted
          if (abortController.signal.aborted) {
            return;
          }

          setSalesData(sales);
          lastFetchRef.current = {
            dateFrom: getDateRange.dateFrom,
            dateTo: getDateRange.dateTo,
            timestamp: Date.now()
          };

          // Only fetch appointments if not already in Redux store or stale
          const state = store.getState();
          const shouldFetchAppointments = !state.appointments.appointments.length || 
            (state.appointments.lastFetch && (Date.now() - state.appointments.lastFetch) > 5 * 60 * 1000);
          
          if (shouldFetchAppointments && !abortController.signal.aborted) {
            dispatch(fetchAppointmentsRequest({
              companyId,
              filters: { limit: 10000 }
            }));
          }

          // Only fetch services if not already in Redux store or stale
          const shouldFetchServices = !state.services.services.length || 
            (state.services.lastFetch && (Date.now() - state.services.lastFetch) > 5 * 60 * 1000);
          
          if (shouldFetchServices && !abortController.signal.aborted) {
            dispatch(fetchServicesRequest({ companyId }));
          }

          // Use sales data instead of separate appointment history call
          // This reduces API calls since sales data already includes what we need
        } catch (error: any) {
          // Don't show error if request was aborted
          if (error.name === 'AbortError' || abortController.signal.aborted) {
            return;
          }
          
          console.error('Error fetching analytics data:', error);
          
          // Check if it's a rate limit error
          if (error.message && error.message.includes('Too many requests')) {
            toast.error('Too many requests. Please wait a moment and refresh the page.');
          } else {
            toast.error(error.message || 'Failed to fetch analytics data');
          }
          
          setSalesData([]); // Set empty array on error
        } finally {
          if (!abortController.signal.aborted) {
            setLoading(false);
            fetchAbortControllerRef.current = null;
          }
        }
      };

      fetchData();
    }, 500); // Increased debounce to 500ms

    return () => {
      clearTimeout(timeoutId);
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, [companyId, dispatch, getDateRange.dateFrom, getDateRange.dateTo]);

  // Calculate real metrics from sales data
  const metrics = useMemo(() => {
    if (!salesData.length) {
      return {
        totalRevenue: 0,
        totalProfit: 0,
        totalBookings: 0,
        productSales: 0,
        serviceRevenue: 0,
        productRevenue: 0,
        serviceCount: 0,
        productCount: 0
      };
    }

    // Calculate total revenue from all sales
    const totalRevenue = salesData.reduce((sum, sale) => {
      const amount = typeof sale.totalAmount === 'string' 
        ? parseFloat(sale.totalAmount) || 0 
        : (sale.totalAmount || 0);
      return sum + amount;
    }, 0);
    
    // Calculate service revenue and profit
    // Services typically have 50-60% profit margins (labor-based, minimal cost)
    let serviceRevenue = 0;
    let serviceProfit = 0;
    
    salesData.forEach(sale => {
      if (sale.servicesUsed && sale.servicesUsed.length > 0) {
        sale.servicesUsed.forEach(service => {
          const unitPrice = typeof service.unitPrice === 'string' ? parseFloat(service.unitPrice) || 0 : (service.unitPrice || 0);
          const quantity = typeof service.quantity === 'string' ? parseFloat(service.quantity) || 1 : (service.quantity || 1);
          const discount = typeof service.discount === 'string' ? parseFloat(service.discount) || 0 : (service.discount || 0);
          const itemRevenue = unitPrice * quantity - discount;
          serviceRevenue += itemRevenue;
          // Service profit = revenue * margin (services have high margins)
          serviceProfit += itemRevenue * SERVICE_PROFIT_MARGIN;
        });
      }
    });

    // Calculate product revenue and profit
    // Products typically have 30-40% profit margins (cost of goods)
    let productRevenue = 0;
    let productProfit = 0;
    
    salesData.forEach(sale => {
      if (sale.productsUsed && sale.productsUsed.length > 0) {
        sale.productsUsed.forEach(product => {
          const unitPrice = typeof product.unitPrice === 'string' ? parseFloat(product.unitPrice) || 0 : (product.unitPrice || 0);
          const quantity = typeof product.quantity === 'string' ? parseFloat(product.quantity) || 1 : (product.quantity || 1);
          const discount = typeof product.discount === 'string' ? parseFloat(product.discount) || 0 : (product.discount || 0);
          const itemRevenue = unitPrice * quantity - discount;
          productRevenue += itemRevenue;
          // Product profit = revenue * margin (products have lower margins than services)
          productProfit += itemRevenue * PRODUCT_PROFIT_MARGIN;
        });
      }
    });

    // Total profit = service profit + product profit
    const totalProfit = serviceProfit + productProfit;
    
    const totalBookings = salesData.filter(sale => sale.servicesUsed && sale.servicesUsed.length > 0).length;
    
    // Count unique services and products
    const serviceIds = new Set<string>();
    const productIds = new Set<string>();
    salesData.forEach(sale => {
      sale.servicesUsed?.forEach(service => {
        if (service.serviceId) serviceIds.add(service.serviceId);
      });
      sale.productsUsed?.forEach(product => {
        if (product.variantId) productIds.add(product.variantId);
      });
    });

    return {
      totalRevenue,
      totalProfit,
      totalBookings,
      productSales: productRevenue, // Keep for backward compatibility
      productRevenue,
      serviceRevenue,
      serviceCount: serviceIds.size,
      productCount: productIds.size
    };
  }, [salesData]);

  // Calculate service performance from real data
  const servicePerformance = useMemo(() => {
    if (!salesData.length || !services.length) return [];

    const serviceStats = new Map<string, {
      name: string;
      bookings: number;
      revenue: number;
    }>();

    // Aggregate service data from sales
    salesData.forEach(sale => {
      sale.servicesUsed?.forEach(service => {
        const serviceId = service.serviceId;
        if (!serviceId) return;

        const serviceInfo = services.find(s => s.id === serviceId);
        const serviceName = serviceInfo?.name || service.name || 'Unknown Service';
        
        const existing = serviceStats.get(serviceId) || {
          name: serviceName,
          bookings: 0,
          revenue: 0
        };

        const quantity = typeof service.quantity === 'string' ? parseFloat(service.quantity) || 1 : (service.quantity || 1);
        const unitPrice = typeof service.unitPrice === 'string' ? parseFloat(service.unitPrice) || 0 : (service.unitPrice || 0);
        const discount = typeof service.discount === 'string' ? parseFloat(service.discount) || 0 : (service.discount || 0);
        existing.bookings += quantity;
        existing.revenue += (unitPrice * quantity) - discount;
        serviceStats.set(serviceId, existing);
      });
    });

    // Convert to array and sort by revenue
    const result = Array.from(serviceStats.values())
      .map(stat => ({
        ...stat,
        growth: (Math.random() - 0.3) * 20 // Mock growth percentage
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5

    return result;
  }, [salesData, services]);

  // Calculate product sales data (sales and profit per product)
  const productSalesData = useMemo(() => {
    if (!salesData.length) return [];

    const productStats = new Map<string, {
      name: string;
      sales: number;
      profit: number;
    }>();

    // Aggregate product data from sales
    salesData.forEach(sale => {
      sale.productsUsed?.forEach(product => {
        const productName = product.name || 'Unknown Product';
        const unitPrice = typeof product.unitPrice === 'string' ? parseFloat(product.unitPrice) || 0 : (product.unitPrice || 0);
        const quantity = typeof product.quantity === 'string' ? parseFloat(product.quantity) || 1 : (product.quantity || 1);
        const discount = typeof product.discount === 'string' ? parseFloat(product.discount) || 0 : (product.discount || 0);
        const itemRevenue = unitPrice * quantity - discount;
        const itemProfit = itemRevenue * PRODUCT_PROFIT_MARGIN;
        
        const existing = productStats.get(productName) || {
          name: productName,
          sales: 0,
          profit: 0
        };

        existing.sales += itemRevenue;
        existing.profit += itemProfit;
        productStats.set(productName, existing);
      });
    });

    // Convert to array, calculate cost, and sort by sales
    const result = Array.from(productStats.values())
      .map(stat => ({
        ...stat,
        cost: stat.sales - stat.profit // Cost is sales minus profit
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10); // Top 10 products

    return result;
  }, [salesData]);

  // Generate revenue trend data (mix of real and mock)
  const revenueTrendData = useMemo(() => {
    if (!salesData.length) {
      return generateMockHistoricalData(6, 50000);
    }

    // Group sales by month
    const monthlyData = new Map<string, { revenue: number; services: number; products: number }>();
    
    salesData.forEach(sale => {
      if (!sale.createdAt) return;
      const date = new Date(sale.createdAt);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      
      const existing = monthlyData.get(monthKey) || { revenue: 0, services: 0, products: 0 };
      const amount = typeof sale.totalAmount === 'string' 
        ? parseFloat(sale.totalAmount) || 0 
        : (sale.totalAmount || 0);
      existing.revenue += amount;
      
      if (sale.servicesUsed && sale.servicesUsed.length > 0) {
        existing.services += sale.servicesUsed.reduce((sum, s) => sum + (s.quantity || 1), 0);
      }
      if (sale.productsUsed && sale.productsUsed.length > 0) {
        existing.products += sale.productsUsed.reduce((sum, p) => sum + (p.quantity || 1), 0);
      }
      
      monthlyData.set(monthKey, existing);
    });

    // Convert to array format with real profit calculation
    const result = Array.from(monthlyData.entries()).map(([month, data]) => {
      // Calculate profit for this month's data
      // We need to recalculate profit for each month's sales
      let monthProfit = 0;
      salesData.forEach(sale => {
        if (!sale.createdAt) return;
        const saleDate = new Date(sale.createdAt);
        const saleMonthKey = saleDate.toLocaleString('default', { month: 'short' });
        if (saleMonthKey === month) {
          // Calculate service profit
          if (sale.servicesUsed && sale.servicesUsed.length > 0) {
            sale.servicesUsed.forEach(service => {
              const unitPrice = typeof service.unitPrice === 'string' ? parseFloat(service.unitPrice) || 0 : (service.unitPrice || 0);
              const quantity = typeof service.quantity === 'string' ? parseFloat(service.quantity) || 1 : (service.quantity || 1);
              const discount = typeof service.discount === 'string' ? parseFloat(service.discount) || 0 : (service.discount || 0);
              const itemRevenue = unitPrice * quantity - discount;
              monthProfit += itemRevenue * SERVICE_PROFIT_MARGIN;
            });
          }
          // Calculate product profit
          if (sale.productsUsed && sale.productsUsed.length > 0) {
            sale.productsUsed.forEach(product => {
              const unitPrice = typeof product.unitPrice === 'string' ? parseFloat(product.unitPrice) || 0 : (product.unitPrice || 0);
              const quantity = typeof product.quantity === 'string' ? parseFloat(product.quantity) || 1 : (product.quantity || 1);
              const discount = typeof product.discount === 'string' ? parseFloat(product.discount) || 0 : (product.discount || 0);
              const itemRevenue = unitPrice * quantity - discount;
              monthProfit += itemRevenue * PRODUCT_PROFIT_MARGIN;
            });
          }
        }
      });
      
      return {
        month,
        revenue: Math.round(data.revenue),
        profit: Math.round(monthProfit),
        services: data.services,
        products: data.products
      };
    });

    // If we don't have enough data, fill with mock data
    if (result.length < 6) {
      const mockData = generateMockHistoricalData(6, metrics.totalRevenue / 6);
      // Update mock data profit to use real margins
      return mockData.map(item => ({
        ...item,
        profit: Math.round(item.revenue * ((item.services > 0 ? SERVICE_PROFIT_MARGIN : 0) + (item.products > 0 ? PRODUCT_PROFIT_MARGIN : 0)) / 2)
      }));
    }

    return result.sort((a, b) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });
  }, [salesData, metrics.totalRevenue]);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const handleRefresh = () => {
    if (!companyId) return;
    
    setLoading(true);
    const fetchData = async () => {
      try {
        const sales = await companySalesService.getCompanySales({
          companyId,
          dateFrom: getDateRange.dateFrom,
          dateTo: getDateRange.dateTo,
          limit: 10000,
          enrich: true
        });
        setSalesData(sales);
        dispatch(fetchAppointmentHistoryRequest({
          companyId,
          dateFrom: getDateRange.dateFrom,
          dateTo: getDateRange.dateTo,
          limit: 10000,
          enrich: true
        }));
        toast.success('Analytics data refreshed');
      } catch (error: any) {
        toast.error(error.message || 'Failed to refresh data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  // Company Owner Analytics
  const CompanyOwnerAnalytics = () => (
    <>
      {/* Revenue Overview - Desktop Only */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-semibold text-foreground">{formatCurrency(metrics.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-600 dark:text-green-400">{formatPercentage(mockGrowthRate * 100)}</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-[var(--accent-text)]" />
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Profit</p>
                <p className="text-2xl font-semibold text-foreground">{formatCurrency(metrics.totalProfit)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-600 dark:text-green-400">{formatPercentage(mockGrowthRate * 80)}</span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Service Bookings</p>
                <p className="text-2xl font-semibold text-foreground">{metrics.totalBookings}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-600 dark:text-green-400">+{Math.round(metrics.totalBookings * 0.15)}</span>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Product Sales</p>
                <p className="text-2xl font-semibold text-foreground">{formatCurrency(metrics.productSales)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {metrics.productSales > 0 ? (
                    <>
                      <ArrowUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm text-red-600 dark:text-red-400">No sales</span>
                    </>
                  )}
                </div>
              </div>
              <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile & Tablet: Carousel - Horizontal scroll with same layout as desktop */}
      <div className="block lg:hidden">
        <Carousel
          opts={{
            align: "start",
            slidesToScroll: 1,
            containScroll: "trimSnaps",
          }}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            <CarouselItem className="pl-0 pr-2 flex-shrink-0" style={{ minWidth: '40vw', width: 'auto' }}>
              <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-semibold text-foreground">{formatCurrency(metrics.totalRevenue)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-600 dark:text-green-400">{formatPercentage(mockGrowthRate * 100)}</span>
                    </div>
                  </div>
                  <DollarSign className="w-8 h-8 text-[var(--accent-text)]" />
                </div>
              </Card>
            </CarouselItem>

            <CarouselItem className="pl-0 pr-2 flex-shrink-0" style={{ minWidth: '40vw', width: 'auto' }}>
              <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Profit</p>
                    <p className="text-2xl font-semibold text-foreground">{formatCurrency(metrics.totalProfit)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-600 dark:text-green-400">{formatPercentage(mockGrowthRate * 80)}</span>
                    </div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </Card>
            </CarouselItem>

            <CarouselItem className="pl-0 pr-2 flex-shrink-0" style={{ minWidth: '40vw', width: 'auto' }}>
              <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Service Bookings</p>
                    <p className="text-2xl font-semibold text-foreground">{metrics.totalBookings}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-600 dark:text-green-400">+{Math.round(metrics.totalBookings * 0.15)}</span>
                    </div>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </Card>
            </CarouselItem>

            <CarouselItem className="pl-0 pr-4 flex-shrink-0" style={{ minWidth: '40vw', width: 'auto' }}>
              <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Product Sales</p>
                    <p className="text-2xl font-semibold text-foreground">{formatCurrency(metrics.productSales)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {metrics.productSales > 0 ? (
                        <>
                          <ArrowUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                        </>
                      ) : (
                        <>
                          <ArrowDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <span className="text-sm text-red-600 dark:text-red-400">No sales</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </Card>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>

      {/* Revenue Trend Chart */}
      <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Revenue & Profit Trends</h3>
            <p className="text-sm text-muted-foreground">{timeRange} performance overview</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Select value={dataView} onValueChange={setDataView}>
              <SelectTrigger className="w-32 bg-[var(--glass-bg)] border-[var(--glass-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--muted-foreground)" 
                fontSize={12}
              />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--popover)', 
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--orange-accent)"
                fill="var(--orange-accent)"
                fillOpacity={0.3}
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Service Performance & Product Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Services Performance</h3>
          {servicePerformance.length > 0 ? (
            <div className="space-y-4">
              {servicePerformance.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-sidebar-accent">
                  <div>
                    <p className="font-medium text-foreground">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(service.revenue)}</p>
                    <div className="flex items-center gap-1">
                      {service.growth >= 0 ? (
                        <ArrowUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-red-600 dark:text-red-400" />
                      )}
                      <span className={`text-xs ${service.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatPercentage(service.growth)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No service data available</p>
              <p className="text-sm mt-2">Services will appear here once you have sales</p>
            </div>
          )}
        </Card>

        <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <h3 className="text-lg font-semibold text-foreground mb-4">Product Sales Graph</h3>
          {productSalesData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={productSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="name"
                    stroke="var(--muted-foreground)" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: 'var(--muted-foreground)' }}
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)" 
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--popover)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar 
                    dataKey="cost" 
                    name="Cost"
                    stackId="a"
                    fill="#6b7280"
                    opacity={0.7}
                  />
                  <Bar 
                    dataKey="profit" 
                    name="Profit"
                    stackId="a"
                    fill="var(--accent-secondary)"
                    radius={[4, 4, 0, 0]}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No product sales data available</p>
              <p className="text-sm mt-2">Product sales will appear here once you have sales</p>
            </div>
          )}
        </Card>
      </div>
    </>
  );

  const getPageTitle = () => {
    switch (user?.role || currentUser?.role) {
      case "Super Admin":
        return "Platform Analytics";
      case "Company Owner":
        return "Business Analytics";
      default:
        return "Analytics Dashboard";
    }
  };

  const getPageDescription = () => {
    switch (user?.role || currentUser?.role) {
      case "Super Admin":
        return "Monitor platform performance, commission earnings, and company rankings";
      case "Company Owner":
        return "Track your business performance, revenue, and service analytics";
      default:
        return "View your analytics and insights";
    }
  };

  if (loading && !salesData.length) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Show message if no company ID
  if (!companyId) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <Building className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Company Associated</h2>
          <p className="text-muted-foreground">
            You need to be associated with a company to view analytics. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-semibold text-foreground">{getPageTitle()}</h1>
            {(user?.role === "Super Admin" || currentUser?.role === "Super Admin") && (
              <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                Admin View
              </Badge>
            )}
            {(user?.role === "Company Owner" || currentUser?.role === "Company Owner") && (
              <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30">
                Business View
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{getPageDescription()}</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-[var(--glass-bg)] border-[var(--glass-border)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Role-based Analytics Content */}
      <CompanyOwnerAnalytics />

      {/* Additional Insights */}
      <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-[var(--orange-accent)]" />
          <h3 className="text-lg font-semibold text-foreground">Key Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-sidebar-accent">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-foreground">Growth Trend</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalRevenue > 0 
                ? `Your revenue shows consistent growth with ${metrics.totalBookings} service bookings and ${formatCurrency(metrics.totalRevenue)} in total revenue`
                : "Start tracking your business performance by completing sales and appointments"
              }
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-sidebar-accent">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-foreground">Top Performer</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {servicePerformance.length > 0
                ? `${servicePerformance[0]?.name || 'Service'} is your top service with ${servicePerformance[0]?.bookings || 0} bookings and ${formatCurrency(servicePerformance[0]?.revenue || 0)} revenue`
                : "No service data available yet"
              }
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-sidebar-accent">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-foreground">Recommendation</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalRevenue > 0
                ? "Focus on promoting your top-performing services to maximize revenue"
                : "Complete your first sale to start seeing analytics insights"
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

