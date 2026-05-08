import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StockAlertProps } from "../types";

export const StockAlert = ({ isOutOfStock }: StockAlertProps) => {
  if (!isOutOfStock) return null;

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg border-red-500/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2">Stock Alert</h3>
          <p className="text-sm text-muted-foreground">
            This variant is out of stock. Consider adding new stock entries.
          </p>
        </div>
      </div>
    </Card>
  );
};
