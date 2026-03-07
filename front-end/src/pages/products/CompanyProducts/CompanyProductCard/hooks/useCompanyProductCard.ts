import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import { fetchCompanyRequest } from "../../../../../store/slices/companiesSlice";
import { companiesService } from "../../../../../services/companies";
import { currenciesService, Currency } from "../../../../../services/currencies";
import { companyProductVariantsService } from "../../../../../services/companyProductVariants";
import { CompanyProduct } from "../../../../../services/companyProducts";
import { CompanyProductVariant } from "../../../../../services/companyProductVariants";
import { isRole, UserRole } from "../../../../../types/user";
import {
  getImageUrl,
  formatPrice as formatPriceUtil,
  getStockStatus,
  getSelectedVariantStockStatus,
  getAvailabilityStatus,
  calculateDisplayValues
} from "../utils";

export const useCompanyProductCard = (product: CompanyProduct) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { companies } = useAppSelector((state) => state.companies);
  
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [variants, setVariants] = useState<CompanyProductVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);
  
  const companyId = product.companyId || user?.companyId;
  const imageUrl = getImageUrl(product, imageError);

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
        let company = companies.find(c => String(c.id) === String(companyId));
        
        if (!company) {
          try {
            company = await companiesService.getCompanyById(String(companyId));
            dispatch(fetchCompanyRequest(String(companyId)));
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
          const currencies = await currenciesService.getCurrencies();
          const usdCurrency = currencies.find(c => c.name === 'USD');
          setCompanyCurrency(usdCurrency || null);
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
  }, [companyId, companies, dispatch, product.companyId]);

  // Fetch variants
  useEffect(() => {
    const fetchVariants = async () => {
      if (!product.id) return;
      try {
        const fetchedVariants = await companyProductVariantsService.getVariantsByCompanyProductId(product.id);
        setVariants(fetchedVariants);
        
        const defaultVariant = fetchedVariants.find(v => v.isDefault);
        if (defaultVariant) {
          setSelectedVariantId(defaultVariant.id);
        } else if (fetchedVariants.length > 0) {
          setSelectedVariantId(fetchedVariants[0].id);
        }
      } catch (error) {
        console.error('Error fetching variants:', error);
      }
    };
    fetchVariants();
  }, [product.id]);

  // Refresh variant data when selected variant changes
  useEffect(() => {
    const refreshVariantData = async () => {
      if (!selectedVariantId || !product.id) return;
      try {
        const refreshedVariant = await companyProductVariantsService.getVariantById(selectedVariantId);
        setVariants(prevVariants => 
          prevVariants.map(v => v.id === selectedVariantId ? refreshedVariant : v)
        );
      } catch (error) {
        console.error('Error refreshing variant data:', error);
      }
    };
    
    if (selectedVariantId) {
      refreshVariantData();
    }
  }, [selectedVariantId, product.id]);

  const selectedVariant = variants.find(v => v.id === selectedVariantId) || null;
  const stockStatus = getStockStatus(variants);
  const selectedStockStatus = getSelectedVariantStockStatus(selectedVariant, stockStatus);
  const availabilityStatus = getAvailabilityStatus(product, selectedVariant);
  const displayValues = calculateDisplayValues(selectedVariant);
  
  const formatPrice = (price: number) => formatPriceUtil(price, companyCurrency);
  
  // Check if user is a regular user (not company owner or admin)
  const isRegularUser = user && !isRole(user.role, UserRole.COMPANY_OWNER) && !isRole(user.role, UserRole.SYSTEM_ADMIN);

  return {
    imageUrl,
    imageLoading,
    imageError,
    variants,
    selectedVariantId,
    selectedVariant,
    companyCurrency,
    stockStatus,
    selectedStockStatus,
    availabilityStatus,
    displayValues,
    formatPrice,
    isRegularUser,
    setSelectedVariantId,
    setImageLoading,
    setImageError
  };
};
