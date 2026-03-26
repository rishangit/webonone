import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAppointmentHistoryRequest } from "@/store/slices/appointmentHistorySlice";
import { fetchStaffRequest } from "@/store/slices/staffSlice";
import { companySalesService } from "@/services/companySales";
import { currenciesService, Currency } from "@/services/currencies";
import { formatAvatarUrl } from "../../../../utils";
import { SaleData, SaleItem } from "../types";

const getDateRange = (range: string) => {
  const now = new Date();
  let dateFrom: string;
  const dateTo: string = now.toISOString().split('T')[0];

  switch (range) {
    case '7days':
      dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case '30days':
      dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case '90days':
      dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case 'year':
      dateFrom = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      break;
    default:
      dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  }

  return { dateFrom, dateTo };
};

export const useSalesData = (
  companyId: string | undefined,
  dateRange: string,
  searchTerm: string,
  debouncedSearchTerm: string,
  currentPage: number,
  itemsPerPage: number
) => {
  const dispatch = useAppDispatch();
  const { history, loading, error, pagination } = useAppSelector((state) => state.appointmentHistory);
  const { staff } = useAppSelector((state) => state.staff);
  const { companies, currentCompany } = useAppSelector((state) => state.companies);
  const { user } = useAppSelector((state) => state.auth);
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);
  const [salesWithItems, setSalesWithItems] = useState<Record<string, any>>({});

  // Fetch company currency
  useEffect(() => {
    const fetchCompanyCurrency = async () => {
      try {
        const company = companyId 
          ? (companies.find(c => String(c.id) === String(companyId)) || currentCompany)
          : null;
        const currencyId = (company as any)?.currencyId;
        
        if (currencyId) {
          const currency = await currenciesService.getCurrency(currencyId);
          setCompanyCurrency(currency);
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

  // Fetch staff
  useEffect(() => {
    if (companyId && staff.length === 0) {
      dispatch(fetchStaffRequest({ companyId }));
    }
  }, [dispatch, companyId, staff.length]);

  const getDateRange = (range: string) => {
    const now = new Date();
    let dateFrom: string;
    const dateTo: string = now.toISOString().split('T')[0];

    switch (range) {
      case '7days':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '30days':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '90days':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'year':
        dateFrom = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      default:
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    return { dateFrom, dateTo };
  };

  // Fetch sales with search and pagination
  useEffect(() => {
    if (!companyId) return;
    
    const { dateFrom, dateTo } = getDateRange(dateRange);
    
    dispatch(fetchAppointmentHistoryRequest({
      companyId,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
      page: currentPage,
      dateFrom,
      dateTo,
      search: debouncedSearchTerm || undefined,
      enrich: true
    }));
  }, [dispatch, companyId, currentPage, itemsPerPage, debouncedSearchTerm, dateRange]);

  // Fetch full sale data with item IDs
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
      const items: SaleItem[] = [];
      
      if (fullSale) {
        if (fullSale.servicesUsed && Array.isArray(fullSale.servicesUsed)) {
          fullSale.servicesUsed.forEach((service: any, index: number) => {
            items.push({
              id: service.id || `service-${item.id}-${index}`,
              name: service.name || `Service-${service.serviceId || 'Unknown'}`,
              quantity: service.quantity || 1,
              unitPrice: service.unitPrice || 0,
              discount: service.discount || 0,
              itemType: 'service',
              serviceId: service.serviceId
            });
          });
        }

        if (fullSale.productsUsed && Array.isArray(fullSale.productsUsed)) {
          fullSale.productsUsed.forEach((product: any, index: number) => {
            items.push({
              id: product.id || `product-${item.id}-${index}`,
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
        if (item.servicesUsed && Array.isArray(item.servicesUsed)) {
          item.servicesUsed.forEach((service: any, index: number) => {
            items.push({
              id: `service-${item.id}-${index}`,
              name: service.name || `Service-${service.serviceId || 'Unknown'}`,
              quantity: service.quantity || 1,
              unitPrice: service.unitPrice || 0,
              discount: service.discount || 0,
              itemType: 'service',
              serviceId: service.serviceId
            });
          });
        }

        if (item.productsUsed && Array.isArray(item.productsUsed)) {
          item.productsUsed.forEach((product: any, index: number) => {
            items.push({
              id: `product-${item.id}-${index}`,
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

      const hasAppointmentId = item.appointmentId && item.appointmentId !== null;
      const hasServices = item.servicesUsed && item.servicesUsed.length > 0;
      const saleType: 'appointment' | 'product' = (hasAppointmentId || hasServices) ? 'appointment' : 'product';
      const status: 'completed' | 'processing' | 'refunded' = 'completed';

      const customerName = item.userName || 
        (item.userFirstName && item.userLastName 
          ? `${item.userFirstName} ${item.userLastName}` 
          : 'Unknown Customer');

      return {
        id: item.id,
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
        paymentMethod: 'Credit Card',
        staffMember: item.staffId ? (staff.find(s => s.id === item.staffId)?.name || `${staff.find(s => s.id === item.staffId)?.firstName || ''} ${staff.find(s => s.id === item.staffId)?.lastName || ''}`.trim() || undefined) : undefined,
        notes: undefined
      } as SaleData;
    });
  }, [history, staff, salesWithItems]);

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

  const refreshSales = async () => {
    if (!companyId) return;
    
    const { dateFrom, dateTo } = getDateRange(dateRange);
    await dispatch(fetchAppointmentHistoryRequest({
      companyId,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
      page: currentPage,
      dateFrom,
      dateTo,
      search: debouncedSearchTerm || undefined,
      enrich: true
    }));
    
    // Refresh sales with items
    const salesMap: Record<string, any> = {};
    const currentHistory = useAppSelector.getState().appointmentHistory.history;
    for (const sale of currentHistory) {
      try {
        const fullSale = await companySalesService.getCompanySaleById(sale.id, true);
        salesMap[sale.id] = fullSale;
      } catch (error) {
        console.error(`Error fetching sale ${sale.id}:`, error);
      }
    }
    setSalesWithItems(salesMap);
  };

  return {
    salesData,
    loading,
    error,
    pagination,
    companyCurrency,
    formatCurrency,
    salesWithItems,
    setSalesWithItems,
    refreshSales
  };
};
