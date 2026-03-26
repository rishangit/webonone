import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCompanyProductRequest } from "@/store/slices/companyProductsSlice";
import { fetchUsersRequest } from "@/store/slices/usersSlice";
import { companyProductVariantsService, CompanyProductVariant } from "@/services/companyProductVariants";
import { companyProductStockService, CompanyProductStock } from "@/services/companyProductStock";
import { currenciesService, Currency } from "@/services/currencies";
import { toast } from "sonner";

export const useVariantStockDetails = (productId: string, variantId: string) => {
  const dispatch = useAppDispatch();
  const { currentCompanyProduct, loading: productLoading } = useAppSelector((state) => state.companyProducts);
  const { user } = useAppSelector((state) => state.auth);
  const { companies, currentCompany } = useAppSelector((state) => state.companies);
  const { users, lastFetch: usersLastFetch } = useAppSelector((state) => state.users);
  
  const [variant, setVariant] = useState<CompanyProductVariant | null>(null);
  const [stockEntries, setStockEntries] = useState<CompanyProductStock[]>([]);
  const [totalStock, setTotalStock] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);

  // Fetch users
  useEffect(() => {
    const shouldFetchUsers = !users || users.length === 0 || 
      !usersLastFetch || (Date.now() - usersLastFetch) > 5 * 60 * 1000;
    
    if (shouldFetchUsers) {
      dispatch(fetchUsersRequest({}));
    }
  }, [dispatch, users, usersLastFetch]);

  // Fetch company currency
  useEffect(() => {
    const fetchCompanyCurrency = async () => {
      try {
        const companyId = user?.companyId;
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
  }, [user?.companyId, companies, currentCompany]);

  // Fetch product
  useEffect(() => {
    if (productId) {
      dispatch(fetchCompanyProductRequest(productId));
    }
  }, [productId, dispatch]);

  // Fetch variant and stock data
  useEffect(() => {
    const fetchData = async () => {
      if (!variantId) return;
      
      setLoading(true);
      try {
        const [variantData, stockData, total] = await Promise.all([
          companyProductVariantsService.getVariantById(variantId),
          companyProductStockService.getStockByVariantId(variantId, true),
          companyProductStockService.getTotalStock(variantId)
        ]);
        
        setVariant(variantData);
        setStockEntries(stockData);
        setTotalStock(total);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(error.message || "Failed to load stock details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [variantId]);

  const refreshStockData = async () => {
    if (!variantId) return;
    try {
      const [variantData, stockData, total] = await Promise.all([
        companyProductVariantsService.getVariantById(variantId),
        companyProductStockService.getStockByVariantId(variantId, true),
        companyProductStockService.getTotalStock(variantId)
      ]);
      
      setVariant(variantData);
      setStockEntries(stockData);
      setTotalStock(total);
    } catch (error: any) {
      console.error("Error refreshing stock data:", error);
    }
  };

  return {
    variant,
    stockEntries,
    totalStock,
    loading: loading || productLoading,
    companyCurrency,
    currentCompanyProduct,
    users,
    refreshStockData
  };
};
