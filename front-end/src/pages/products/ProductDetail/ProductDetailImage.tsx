import { Card } from "../../../components/ui/card";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import { formatAvatarUrl } from "../../../utils";

interface ProductDetailImageProps {
  imageUrl?: string;
  productName: string;
}

export const ProductDetailImage = ({
  imageUrl,
  productName,
}: ProductDetailImageProps) => {
  const displayImageUrl = imageUrl 
    ? (imageUrl.startsWith('http') ? imageUrl : formatAvatarUrl(imageUrl))
    : undefined;

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <div className="aspect-square rounded-lg overflow-hidden">
        <ImageWithFallback 
          src={displayImageUrl}
          alt={productName}
          className="w-full h-full object-cover"
          fallbackSrc="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop"
        />
      </div>
    </Card>
  );
};
