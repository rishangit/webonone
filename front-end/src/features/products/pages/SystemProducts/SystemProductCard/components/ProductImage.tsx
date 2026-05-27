import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { ProductImageProps } from "../types";
import { getImageUrl, getFallbackImage } from "../utils";

export const ProductImage = ({ imageUrl, productName, variant = "grid" }: ProductImageProps) => {
  const url = getImageUrl(imageUrl);
  const fallback = getFallbackImage();

  if (variant === "list") {
    return (
      <ImageWithFallback
        src={url}
        alt={productName}
        className="absolute inset-0 h-full w-full object-cover"
        fallbackSrc="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=64&fit=crop"
      />
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
