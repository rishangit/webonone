import { formatAvatarUrl } from "../../../../utils";

export const getImageUrl = (imageUrl: string | undefined): string | undefined => {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith('http')) return imageUrl;
  return formatAvatarUrl(imageUrl);
};

export const getFallbackImage = (): string => {
  return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop";
};
