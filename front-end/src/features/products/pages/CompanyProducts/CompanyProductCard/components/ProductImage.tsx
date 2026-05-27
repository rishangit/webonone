import { CARD_LIST_AVATAR_CLASS } from "@/components/ui/avatar";
import { Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductImageProps {
  imageUrl: string | null;
  imageLoading: boolean;
  imageError: boolean;
  productName: string;
  stockStatus: { status: string; color: string };
  variant?: "grid" | "list";
  showStockBadge?: boolean;
  onLoad: () => void;
  onError: () => void;
}

export const ProductImage = ({
  imageUrl,
  imageLoading,
  imageError,
  productName,
  stockStatus,
  variant = "grid",
  showStockBadge = true,
  onLoad,
  onError
}: ProductImageProps) => {
  if (variant === "list") {
    return (
      <>
        {imageLoading && imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={productName}
            className="absolute inset-0 h-full w-full object-cover"
            onLoad={onLoad}
            onError={(e) => {
              onError();
              (e.target as HTMLImageElement).style.display = 'none';
            }}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-800">
            <ImageIcon className="w-10 h-10" />
          </div>
        )}
        {showStockBadge ? (
          <div className="absolute top-3 left-3 z-10">
            <Badge className={`${stockStatus.color} text-xs border`}>
              {stockStatus.status === 'In Stock' ? "✓" : stockStatus.status === 'Low Stock' ? "!" : "×"}
            </Badge>
          </div>
        ) : null}
      </>
    );
  }

  // Grid view
  return (
    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
      {imageLoading && imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onLoad={onLoad}
          onError={(e) => {
            onError();
            (e.target as HTMLImageElement).style.display = 'none';
          }}
          style={{ display: imageLoading ? 'none' : 'block' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <ImageIcon className="w-16 h-16" />
        </div>
      )}
    </div>
  );
};
