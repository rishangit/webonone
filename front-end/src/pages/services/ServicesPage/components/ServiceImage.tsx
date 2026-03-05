import { ServiceImageProps } from "../types";

export const ServiceImage = ({ imageUrl, serviceName, variant = "grid" }: ServiceImageProps) => {
  if (variant === "list") {
    return (
      <div className="flex-shrink-0 relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 w-20 h-16 flex items-center justify-center">
        <img 
          src={imageUrl} 
          alt={serviceName}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative h-48 overflow-hidden">
      <img 
        src={imageUrl} 
        alt={serviceName}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
};
