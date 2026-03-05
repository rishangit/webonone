import { Package } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { DateDisplay } from "../../../../components/common/DateDisplay";
import { ProductSaleCardProps } from "../types";

export const ProductSaleCard = ({
  product,
  formatCurrency,
}: ProductSaleCardProps) => {
  return (
    <Card className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--accent-bg)] transition-colors">
      <div className="flex items-start gap-3">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-lg border border-[var(--glass-border)]"
          />
        ) : (
          <div className="w-16 h-16 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{product.name}</h4>
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <div className="space-y-1 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Sold:</span>
              <span className="text-foreground font-medium">{product.totalSold}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Revenue:</span>
              <span className="text-[var(--accent-text)] font-medium">{formatCurrency(product.revenue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg. Price:</span>
              <span className="text-foreground">{formatCurrency(product.averagePrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Sold:</span>
              <span className="text-foreground"><DateDisplay date={product.lastSold} /></span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
