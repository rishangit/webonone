import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAppointmentHistoryRequest } from "@/shared/store/appointments";
import { fetchStaffRequest } from "@/shared/store/staff";
import { companySalesService, SalesSummary } from "@/features/sales/services";
import { currenciesService, Currency } from "@/shared/services/currencies";
import { isRole, UserRole } from "@/shared/types/user";
import { formatAvatarUrl } from "@/shared/utils";
import { getSalesDateRange } from "@/features/sales/utils/dateRange";
import { SaleData, SaleItem } from "../types";

const normalizePaymentMethod = (value: unknown): "Cash" | "Card" => {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized.includes("cash")) {
    return "Cash";
  }

  if (normalized.includes("card") || normalized.includes("credit") || normalized.includes("debit")) {
    return "Card";
  }

  return "Card";
};

export const useSalesData = (
  companyId: string | undefined,
  dateRange: string,
  debouncedSearchTerm: string,
  currentPage: number,
  itemsPerPage: number,
  filterType: string
) => {
  const dispatch = useAppDispatch();
  const { history, loading, error, pagination } = useAppSelector((state) => state.appointmentHistory);
  const { staff } = useAppSelector((state) => state.staff);
  const { companies, currentCompany } = useAppSelector((state) => state.companies);
  const { user } = useAppSelector((state) => state.auth);
  const isCompanyOwner = isRole(user?.role, UserRole.COMPANY_OWNER);
  const currentUserId = user?.id ? String(user.id) : "";
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);
  const [salesWithItems, setSalesWithItems] = useState<Record<string, any>>({});
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const saleTypeParam: 'appointment' | 'product' | undefined =
    filterType === "appointment" || filterType === "product" ? filterType : undefined;

  useEffect(() => {
    const fetchCompanyCurrency = async () => {
      try {
        const company = companyId
          ? (companies.find(c => String(c.id) === String(companyId)) || currentCompany)
          : null;
        const currencyId = (company as { currencyId?: string })?.currencyId;

        if (currencyId) {
          const currency = await currenciesService.getCurrency(currencyId);
          setCompanyCurrency(currency);
        } else {
          try {
            const currencies = await currenciesService.getCurrencies();
            const usdCurrency = currencies.find(c => c.name === 'USD');
            setCompanyCurrency(usdCurrency || null);
          } catch {
            setCompanyCurrency(null);
          }
        }
      } catch {
        try {
          const currencies = await currenciesService.getCurrencies();
          const usdCurrency = currencies.find(c => c.name === 'USD');
          setCompanyCurrency(usdCurrency || null);
        } catch {
          setCompanyCurrency(null);
        }
      }
    };

    fetchCompanyCurrency();
  }, [companyId, companies, currentCompany]);

  useEffect(() => {
    if (companyId && staff.length === 0) {
      dispatch(fetchStaffRequest({ companyId }));
    }
  }, [dispatch, companyId, staff.length]);

  const buildFetchPayload = useCallback(() => {
    const { dateFrom, dateTo } = getSalesDateRange(dateRange);
    const shouldFilterByUser = !isCompanyOwner && !!currentUserId;

    return {
      companyId,
      userId: shouldFilterByUser ? currentUserId : undefined,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
      page: currentPage,
      ...(dateFrom && dateTo ? { dateFrom, dateTo } : {}),
      search: debouncedSearchTerm || undefined,
      saleType: saleTypeParam,
      enrich: true as const,
    };
  }, [
    companyId,
    currentUserId,
    isCompanyOwner,
    itemsPerPage,
    currentPage,
    dateRange,
    debouncedSearchTerm,
    saleTypeParam,
  ]);

  useEffect(() => {
    if (!companyId && !currentUserId) return;
    dispatch(fetchAppointmentHistoryRequest(buildFetchPayload()));
  }, [dispatch, companyId, currentUserId, buildFetchPayload]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!companyId) {
        setSummary(null);
        return;
      }

      setSummaryLoading(true);
      try {
        const { dateFrom, dateTo } = getSalesDateRange(dateRange);
        const shouldFilterByUser = !isCompanyOwner && !!currentUserId;
        const data = await companySalesService.getSalesSummary({
          companyId,
          userId: shouldFilterByUser ? currentUserId : undefined,
          ...(dateFrom && dateTo ? { dateFrom, dateTo } : {}),
          search: debouncedSearchTerm || undefined,
          saleType: saleTypeParam,
        });
        setSummary(data);
      } catch (err) {
        console.error('Error fetching sales summary:', err);
        setSummary(null);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, [companyId, currentUserId, isCompanyOwner, dateRange, debouncedSearchTerm, saleTypeParam]);

  useEffect(() => {
    const fetchSalesWithItems = async () => {
      if (!companyId || history.length === 0) return;

      const salesMap: Record<string, any> = {};
      for (const sale of history) {
        try {
          const fullSale = await companySalesService.getCompanySaleById(sale.id, true);
          salesMap[sale.id] = fullSale;
        } catch (err) {
          console.error(`Error fetching sale ${sale.id}:`, err);
        }
      }
      setSalesWithItems(salesMap);
    };

    fetchSalesWithItems();
  }, [history, companyId]);

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
        paymentMethod: normalizePaymentMethod(fullSale?.paymentMethod ?? (item as { paymentMethod?: string }).paymentMethod),
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
    if (!companyId && !currentUserId) return;

    await dispatch(fetchAppointmentHistoryRequest(buildFetchPayload()));

    const salesMap: Record<string, any> = {};
    for (const sale of history) {
      try {
        const fullSale = await companySalesService.getCompanySaleById(sale.id, true);
        salesMap[sale.id] = fullSale;
      } catch (err) {
        console.error(`Error fetching sale ${sale.id}:`, err);
      }
    }
    setSalesWithItems(salesMap);
  };

  return {
    salesData,
    loading,
    summaryLoading,
    error,
    pagination,
    summary,
    companyCurrency,
    formatCurrency,
    salesWithItems,
    setSalesWithItems,
    refreshSales
  };
};
