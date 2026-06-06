import { useState, useEffect } from "react";
import { companySalesService, ProductSalesStats } from "@/features/sales/services";
import { getSalesDateRange } from "@/features/sales/utils/dateRange";
import { currenciesService, Currency } from "@/shared/services/currencies";
import { useAppSelector } from "@/store/hooks";
import { isRole, UserRole } from "@/shared/types/user";

export const useProductSalesStats = (
  companyProductId: string | undefined,
  dateRange: string
) => {
  const { user } = useAppSelector((state) => state.auth);
  const { companies, currentCompany } = useAppSelector((state) => state.companies);
  const companyId = user?.companyId;
  const isCompanyOwner = isRole(user?.role, UserRole.COMPANY_OWNER);

  const [stats, setStats] = useState<ProductSalesStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const company = companyId
          ? (companies.find(c => String(c.id) === String(companyId)) || currentCompany)
          : null;
        const currencyId = (company as { currencyId?: string })?.currencyId;
        if (currencyId) {
          setCompanyCurrency(await currenciesService.getCurrency(currencyId));
        }
      } catch {
        setCompanyCurrency(null);
      }
    };
    fetchCurrency();
  }, [companyId, companies, currentCompany]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!companyProductId || !companyId) return;

      setLoading(true);
      setError(null);
      try {
        const { dateFrom, dateTo } = getSalesDateRange(dateRange);
        const data = await companySalesService.getProductStats(companyProductId, {
          companyId,
          ...(dateFrom && dateTo ? { dateFrom, dateTo } : {}),
          ...(!isCompanyOwner && user?.id ? { staffId: String(user.id) } : {}),
        });
        setStats(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load product statistics";
        setError(message);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [companyProductId, companyId, dateRange, isCompanyOwner, user?.id]);

  const formatCurrency = (amount: number) => {
    const numPrice = Number(amount) || 0;
    if (companyCurrency) {
      const decimals = companyCurrency.decimals || 2;
      const roundedPrice = Math.round(numPrice / companyCurrency.rounding) * companyCurrency.rounding;
      const formattedNumber = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(roundedPrice);
      return `${companyCurrency.symbol} ${formattedNumber}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numPrice).replace('$', '$ ');
  };

  return { stats, loading, error, formatCurrency };
};
