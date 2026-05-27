import { Service as ServiceType } from "@/features/services/services";
import { Currency } from "@/shared/services/currencies";
import { formatAvatarUrl } from "@/shared/utils";

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

const SERVICE_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop";

export const getImageUrl = (service: ServiceType): string => {
  const raw = service.images?.[0] || service.image || "";
  const primary = typeof raw === "string" ? raw.trim() : "";
  if (!primary || primary === "null" || primary === "undefined") {
    return SERVICE_IMAGE_FALLBACK;
  }
  if (primary.startsWith("companies/") || primary.startsWith("/uploads/")) {
    return formatAvatarUrl(primary) || SERVICE_IMAGE_FALLBACK;
  }
  if (primary.startsWith("http://") || primary.startsWith("https://")) {
    return primary;
  }
  return formatAvatarUrl(primary) || SERVICE_IMAGE_FALLBACK;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Active": return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
    case "Inactive": return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    case "Draft": return "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30";
    default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
  }
};
