import { DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "../../../../../components/ui/badge";

interface ProductPricingProps {
  displayCostPrice: number;
  displaySellPrice: number;
  displayMargin: string | null;
  selectedVariant: any;
  formatPrice: (price: number) => string;
  variant?: "grid" | "list";
  hideCostAndMargin?: boolean; // Hide cost price and margin for users
}

export const ProductPricing = ({
  displayCostPrice,
  displaySellPrice,
  displayMargin,
  selectedVariant,
  formatPrice,
  variant = "grid",
  hideCostAndMargin = false
}: ProductPricingProps) => {
  if (variant === "list") {
    if (hideCostAndMargin) {
      // Only show sell price for users
      return (
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 flex-shrink-0" />
            <div>
              <div className="font-medium text-foreground">{formatPrice(displaySellPrice)}</div>
              <div className="text-xs">{selectedVariant ? 'Price' : 'Avg Price'}</div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <DollarSign className="w-4 h-4 flex-shrink-0" />
          <div>
            <div className="font-medium text-foreground">{formatPrice(displayCostPrice)}</div>
            <div className="text-xs">{selectedVariant ? 'Cost' : 'Avg Cost'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4 flex-shrink-0" />
          <div>
            <div className="font-medium text-foreground">{formatPrice(displaySellPrice)}</div>
            <div className="text-xs">{selectedVariant ? 'Sell' : 'Avg Sell'}</div>
          </div>
        </div>
        {displayMargin && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 flex-shrink-0" />
            <div>
              <div className="font-medium text-green-600 dark:text-green-400">{displayMargin}%</div>
              <div className="text-xs">Margin</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Grid view - pricing details in card body only
  if (hideCostAndMargin) {
    // Only show sell price for users
    return (
      <div className="pt-2 border-t border-[var(--glass-border)]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{selectedVariant ? 'Price:' : 'Avg Price:'}</span>
          <span className="text-green-600 dark:text-green-400 font-medium">{formatPrice(displaySellPrice)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--glass-border)]">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{selectedVariant ? 'Cost:' : 'Avg Cost:'}</span>
        <span className="text-card-foreground font-medium">{formatPrice(displayCostPrice)}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{selectedVariant ? 'Sell:' : 'Avg Sell:'}</span>
        <span className="text-green-600 dark:text-green-400 font-medium">{formatPrice(displaySellPrice)}</span>
      </div>
      {displayMargin && (
        <div className="flex items-center justify-between text-sm col-span-2">
          <span className="text-muted-foreground">Margin:</span>
          <span className="text-green-600 dark:text-green-400 font-medium">{displayMargin}%</span>
        </div>
      )}
    </div>
  );
};
