import { CompanyProductVariant } from "../../../../services/companyProductVariants";
import { Currency } from "../../../../services/currencies";
import { CompanyProduct } from "../../../../services/companyProducts";
import { formatAvatarUrl } from "../../../../utils";

export const getImageUrl = (product: CompanyProduct, imageError: boolean): string | null => {
  if (imageError) return null;
  const url = product.imageUrl;
  if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
    return null;
  }
  return url.startsWith('http') ? url : formatAvatarUrl(url);
};

export const formatPrice = (price: number | undefined | null, companyCurrency: Currency | null): string => {
  const numPrice = Number(price) || 0;
  
  if (companyCurrency) {
    const decimals = companyCurrency.decimals || 2;
    
    if (isNaN(numPrice)) {
      return `${companyCurrency.symbol} ${(0).toFixed(decimals)}`;
    }
    
    const roundedPrice = Math.round(numPrice / companyCurrency.rounding) * companyCurrency.rounding;
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(roundedPrice);
    
    return `${companyCurrency.symbol} ${formattedNumber}`;
  }
  
  if (isNaN(numPrice)) {
    return '$ 0.00';
  }
  
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(numPrice);
  return formatted.replace('$', '$ ');
};

export const getStockStatus = (variants: CompanyProductVariant[]): { status: string; color: string } => {
  const totalStock = variants.reduce((sum, v) => sum + (v.activeStock?.quantity || 0), 0);
  
  if (variants.length === 0) return { status: 'Unknown', color: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30' };
  if (totalStock === 0) return { status: 'Out of Stock', color: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30' };
  if (totalStock < 10) return { status: 'Low Stock', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' };
  return { status: 'In Stock', color: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30' };
};

export const getSelectedVariantStockStatus = (
  selectedVariant: CompanyProductVariant | null,
  defaultStatus: { status: string; color: string }
): { status: string; color: string } => {
  if (!selectedVariant) return defaultStatus;
  const stock = selectedVariant.activeStock?.quantity || 0;
  if (stock === 0) return { status: 'Out of Stock', color: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30' };
  if (stock < 10) return { status: 'Low Stock', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' };
  return { status: 'In Stock', color: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30' };
};

export const getAvailabilityStatus = (
  product: CompanyProduct,
  selectedVariant: CompanyProductVariant | null
): {
  isAvailable: boolean;
  type: 'sell' | 'service' | 'both';
  text: string;
} => {
  if (!selectedVariant) {
    return {
      isAvailable: product.isAvailableForPurchase,
      type: 'service' as 'sell' | 'service' | 'both',
      text: product.isAvailableForPurchase ? 'Available' : 'Unavailable'
    };
  }
  
  if (!selectedVariant.isActive) {
    return {
      isAvailable: false,
      type: selectedVariant.type || 'service',
      text: 'Unavailable'
    };
  }
  
  const type = selectedVariant.type || 'service';
  let text = 'Available';
  
  if (type === 'sell') {
    text = 'Available: For Sale Only';
  } else if (type === 'service') {
    text = 'Available: Service Use Only';
  } else if (type === 'both') {
    text = 'Available: For Sale and Service Use';
  }
  
  return {
    isAvailable: true,
    type: type,
    text: text
  };
};

export const calculateDisplayValues = (
  selectedVariant: CompanyProductVariant | null
): {
  displayCostPrice: number;
  displaySellPrice: number;
  displayCurrentStock: number;
  displayMinStock: number;
  displayMaxStock: number;
  displayStockUnit: string;
  displayMargin: string | null;
} => {
  const displayCostPrice = selectedVariant?.activeStock?.costPrice !== undefined && selectedVariant.activeStock.costPrice !== null
    ? (() => {
        const price = Number(selectedVariant.activeStock.costPrice);
        return isNaN(price) ? 0 : price;
      })()
    : 0;
    
  const displaySellPrice = selectedVariant?.activeStock?.sellPrice !== undefined && selectedVariant.activeStock.sellPrice !== null
    ? (() => {
        const price = Number(selectedVariant.activeStock.sellPrice);
        return isNaN(price) ? 0 : price;
      })()
    : 0;
    
  const displayCurrentStock = selectedVariant?.activeStock?.quantity !== undefined && selectedVariant.activeStock.quantity !== null
    ? (() => {
        const stock = Number(selectedVariant.activeStock.quantity);
        return isNaN(stock) ? 0 : stock;
      })()
    : 0;
    
  const displayMinStock = selectedVariant?.minStock !== undefined ? selectedVariant.minStock : 0;
  const displayMaxStock = selectedVariant?.maxStock !== undefined ? selectedVariant.maxStock : 0;
  const displayStockUnit = 'units';
  
  const displayMargin = displaySellPrice > 0 && displayCostPrice > 0
    ? (() => {
        const sell = Number(displaySellPrice) || 0;
        const cost = Number(displayCostPrice) || 0;
        if (cost === 0 || isNaN(sell) || isNaN(cost)) return null;
        const margin = ((sell - cost) / cost * 100);
        return isNaN(margin) ? null : margin.toFixed(1);
      })()
    : null;
  
  return {
    displayCostPrice,
    displaySellPrice,
    displayCurrentStock,
    displayMinStock,
    displayMaxStock,
    displayStockUnit,
    displayMargin
  };
};
