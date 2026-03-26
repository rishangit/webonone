import { Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductImageProps {
  imageUrl: string | null;
  imageLoading: boolean;
  imageError: boolean;
  productName: string;
  stockStatus: { status: string; color: string };
  variant?: "grid" | "list";
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
  onLoad,
  onError
}: ProductImageProps) => {
  if (variant === "list") {
    return (
      <div className="flex-shrink-0 relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 w-20 h-16 flex items-center justify-center">
        {imageLoading && imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={productName}
            className="w-full h-full object-cover"
            onLoad={onLoad}
            onError={(e) => {
              onError();
              (e.target as HTMLImageElement).style.display = 'none';
            }}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}
        <div className="absolute top-1 right-1">
          <Badge className={`${stockStatus.color} text-xs border`}>
            {stockStatus.status === 'In Stock' ? "✓" : stockStatus.status === 'Low Stock' ? "!" : "×"}
          </Badge>
        </div>
      </div>
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
