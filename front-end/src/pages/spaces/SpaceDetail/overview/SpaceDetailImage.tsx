import { Badge } from "../../../../components/ui/badge";
import { Card } from "../../../../components/ui/card";
import { formatAvatarUrl } from "../../../../utils";
import { Space } from "../../../../services/spaces";

interface SpaceDetailImageProps {
  space: Space;
}

export const SpaceDetailImage = ({ space }: SpaceDetailImageProps) => {
  const getImageUrl = () => {
    if (space.imageUrl) {
      return formatAvatarUrl(space.imageUrl);
    }
    return '/placeholder-space.png';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300";
      case "Inactive":
        return "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300";
      case "Maintenance":
        return "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300";
    }
  };

  return (
    <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] w-full">
      <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 w-full h-64 md:h-80 flex items-center justify-center">
        <img 
          src={getImageUrl()} 
          alt={space.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 z-10">
          <Badge className={`${getStatusColor(space.status)} text-xs border`}>
            {space.status}
          </Badge>
        </div>
      </div>
    </Card>
  );
};
