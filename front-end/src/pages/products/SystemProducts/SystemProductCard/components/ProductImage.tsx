import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { ProductImageProps } from "../types";
import { getImageUrl, getFallbackImage } from "../utils";

export const ProductImage = ({ imageUrl, productName, variant = "grid" }: ProductImageProps) => {
  const url = getImageUrl(imageUrl);
  const fallback = getFallbackImage();

  if (variant === "list") {
    return (
      <div className="flex-shrink-0">
        <ImageWithFallback
          src={url}
          alt={productName}
          className="w-20 h-16 object-cover rounded-lg"
          fallbackSrc="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=64&fit=crop"
        />
      </div>
    );
  }

  return (
    <div className="relative h-48 overflow-hidden">
      <ImageWithFallback
        src={url}
        alt={productName}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        fallbackSrc={fallback}
      />
    </div>
  );
};
