export { getImageUrl as showcaseGetServiceImageUrl } from "@/features/services/pages/ServicesPage/utils";

export const showcaseFormatDuration = (minutes: number): string => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
};

export const showcaseFormatPrice = (price: number): string => {
  const numPrice = Number(price) || 0;
  return `$ ${numPrice.toFixed(2)}`;
};

export { getStatusColor as showcaseGetStatusColor } from "@/features/services/pages/ServicesPage/utils";
