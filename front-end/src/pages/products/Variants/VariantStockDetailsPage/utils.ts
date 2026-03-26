import { formatCurrency } from "../../../../utils";
import { Currency } from "@/services/currencies";

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
  
  const formatted = formatCurrency(numPrice, 'USD');
  return formatted.replace('$', '$ ');
};
