import { Warehouse, TrendingUp, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { StockOverviewProps } from "../types";

export const StockOverview = ({
  totalStock,
  activeStockQuantity,
  stockEntriesCount,
  totalCostValue,
  totalSellValue,
  formatPrice,
  isOutOfStock,
}: StockOverviewProps) => {
  const profit = totalSellValue - totalCostValue;
  const incomePercentage = totalCostValue > 0 
    ? (((totalSellValue - totalCostValue) / totalCostValue) * 100).toFixed(1)
    : '0.0';

  return (
    <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--accent-border)]/30 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Warehouse className="w-4 h-4 text-[var(--accent-primary)]" />
          <h3 className="font-semibold text-foreground text-sm">Stock Overview</h3>
        </div>
        <Badge className={isOutOfStock ? "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30" : "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30"}>
          {isOutOfStock ? (
            <span className="flex items-center gap-1 text-xs">
              <AlertTriangle className="w-3 h-3" />
              Out of Stock
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs">
              <CheckCircle className="w-3 h-3" />
              In Stock
            </span>
          )}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Total Available Stock</Label>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <p className="text-2xl font-bold text-foreground">{totalStock}</p>
              <p className="text-xs text-muted-foreground">units</p>
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">Active Stock</Label>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <p className="text-2xl font-bold text-[var(--accent-primary)]">
                {activeStockQuantity}
              </p>
              <p className="text-xs text-muted-foreground">units</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
              <TrendingUp className="w-3 h-3 text-green-500" />
              Entries
            </Label>
            <p className="text-sm font-semibold text-foreground">{stockEntriesCount}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
              <DollarSign className="w-3 h-3 text-blue-500" />
              Cost Value
            </Label>
            <p className="text-sm font-semibold text-foreground">{formatPrice(totalCostValue)}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
              <DollarSign className="w-3 h-3 text-green-500" />
              Sell Value
            </Label>
            <p className="text-sm font-semibold text-green-500">{formatPrice(totalSellValue)}</p>
          </div>
        </div>

        {totalCostValue > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                <TrendingUp className="w-3 h-3 text-purple-500" />
                Profit
              </Label>
              <p className="text-sm font-semibold text-purple-500">
                {formatPrice(profit)}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                <TrendingUp className="w-3 h-3 text-purple-500" />
                Income Percentage
              </Label>
              <p className="text-sm font-semibold text-purple-500">
                {incomePercentage}%
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
