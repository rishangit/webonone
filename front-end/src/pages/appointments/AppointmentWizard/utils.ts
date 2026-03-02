// Helper function to convert 12-hour format to 24-hour format
export const convertTo24Hour = (time12h: string): string => {
  if (!time12h) return "";
  
  // If already in 24-hour format, return as is
  if (!time12h.includes('AM') && !time12h.includes('PM')) {
    return time12h;
  }
  
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = '00';
  }
  
  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  
  return `${hours.padStart(2, '0')}:${minutes || '00'}`;
};

// Helper function to convert 24-hour format to 12-hour AM/PM format
export const convertTo12Hour = (time24h: string): string => {
  if (!time24h) return "";
  
  // If already in 12-hour format, return as is
  if (time24h.includes('AM') || time24h.includes('PM')) {
    return time24h;
  }
  
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours, 10);
  const min = minutes || '00';
  
  if (hour === 0) {
    return `12:${min} AM`;
  } else if (hour === 12) {
    return `12:${min} PM`;
  } else if (hour < 12) {
    return `${hour}:${min} AM`;
  } else {
    return `${hour - 12}:${min} PM`;
  }
};

// Format price using company currency
export const formatPrice = (price: number | string, companyCurrency: any): string => {
  const numPrice = typeof price === 'string' 
    ? parseFloat(price.replace(/[^0-9.]/g, '')) 
    : Number(price) || 0;
  
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
  
  return `$ ${numPrice.toFixed(2)}`;
};

// Get image URL - handle both image and imageUrl properties, and format if needed
export const getImageUrl = (imageSrc: string | undefined, formatAvatarUrl: (url: string, ...args: any[]) => string): string | undefined => {
  if (!imageSrc) return undefined;
  // Check if it's a URL path that needs formatting
  if (imageSrc.startsWith('companies/') || imageSrc.startsWith('/uploads/')) {
    return formatAvatarUrl(imageSrc);
  }
  return imageSrc;
};
