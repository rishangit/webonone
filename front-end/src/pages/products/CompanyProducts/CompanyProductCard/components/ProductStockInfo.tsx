import { Package, AlertTriangle } from "lucide-react";
import { Badge } from "../../../../../components/ui/badge";

interface ProductStockInfoProps {
  displayCurrentStock: number;
  displayMinStock: number;
  displayMaxStock: number;
  displayStockUnit: string;
  selectedVariant: any;
  variant?: "grid" | "list";
}

export const ProductStockInfo = ({
  displayCurrentStock,
  displayMinStock,
  displayMaxStock,
  displayStockUnit,
  selectedVariant,
  variant = "grid"
}: ProductStockInfoProps) => {
  if (variant === "list") {
    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="w-4 h-4 flex-shrink-0" />
            <div>
              <div className="font-medium text-foreground">
                {displayCurrentStock}
              </div>
              <div className="text-xs">{displayStockUnit}</div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{selectedVariant ? 'Stock Range' : 'Total Stock Range'}</span>
            <span>
              {displayCurrentStock} {displayStockUnit}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-[var(--accent-primary)] h-2 rounded-full transition-all"
              style={{ 
                width: `${Math.min(100, displayCurrentStock > 0 ? 100 : 0)}%` 
              }}
            />
          </div>
        </div>
      </>
    );
  }

  // Grid view
  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{selectedVariant ? 'Stock:' : 'Total Stock:'}</span>
        <div className="flex items-center gap-2">
          <span className="text-card-foreground font-medium">
            {displayCurrentStock} {displayStockUnit}
          </span>
          {selectedVariant && (selectedVariant.activeStock?.quantity || 0) < 10 && (
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          )}
        </div>
      </div>
      
      {displayMaxStock > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>
              Stock: {displayCurrentStock} / {displayMaxStock}
            </span>
            <span>
              {Math.round((displayCurrentStock / displayMaxStock) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                displayCurrentStock < displayMinStock
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ 
                width: `${Math.min((displayCurrentStock / displayMaxStock) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
