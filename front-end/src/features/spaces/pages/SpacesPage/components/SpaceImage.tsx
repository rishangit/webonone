import { SpaceImageProps } from "../types";
import { getImageUrl } from "../utils";
import { Space } from "@/features/spaces/services";

export const SpaceImage = ({ imageUrl, spaceName, variant = "grid" }: SpaceImageProps) => {
  const space = { imageUrl } as Space;
  const imageSrc = getImageUrl(space);
  
  if (variant === "list") {
    return (
      <img src={imageSrc} alt={spaceName} className="absolute inset-0 h-full w-full object-cover" />
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
