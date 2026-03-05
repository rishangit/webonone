import { Service as ServiceType } from "../../../services/services";
import { Currency } from "../../../services/currencies";
import { formatAvatarUrl } from "../../../utils";

export const formatDuration = (minutes: number): string => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
};

export const formatPrice = (price: number, companyCurrency: Currency | null): string => {
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

export const getImageUrl = (service: ServiceType): string => {
  if (service.image) {
    if (service.image.startsWith('companies/') || service.image.startsWith('/uploads/')) {
      return formatAvatarUrl(service.image);
    }
    return service.image;
  }
  return "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop";
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Active": return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
    case "Inactive": return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    case "Draft": return "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30";
    default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
  }
};
