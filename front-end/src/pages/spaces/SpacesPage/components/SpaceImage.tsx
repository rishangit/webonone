import { SpaceImageProps } from "../types";
import { getImageUrl } from "../utils";
import { Space } from "@/services/spaces";

export const SpaceImage = ({ imageUrl, spaceName, variant = "grid" }: SpaceImageProps) => {
  const space = { imageUrl } as Space;
  const imageSrc = getImageUrl(space);
  
  if (variant === "list") {
    return (
      <div className="flex-shrink-0">
        <img 
          src={imageSrc} 
          alt={spaceName}
          className="w-20 h-16 object-cover rounded-lg"
        />
      </div>
    );
  }

  return (
    <div className="relative h-48 overflow-hidden">
      <img 
        src={imageSrc} 
        alt={spaceName}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
};
