import { Space } from "@/services/spaces";
import { formatAvatarUrl } from "../../../utils";

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Active": 
      return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
    case "Inactive": 
      return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    case "Maintenance": 
      return "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30";
    default: 
      return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
  }
};

export const getImageUrl = (space: Space): string => {
  if (space.imageUrl) {
    return formatAvatarUrl(space.imageUrl);
  }
  return "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop";
};
