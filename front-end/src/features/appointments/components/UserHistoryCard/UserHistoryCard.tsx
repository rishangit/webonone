import { Calendar, Clock, FileText, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TransformedUserHistoryRecord } from "@/features/appointments/types/userHistory";

const defaultFormatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);

export interface UserHistoryCardProps {
  history: TransformedUserHistoryRecord;
  staffName: string;
  formatCurrency?: (amount: number) => string;
}

export function UserHistoryCard({
  history,
  staffName,
  formatCurrency = defaultFormatCurrency,
}: UserHistoryCardProps) {
  return (
    <Card className="p-5 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Sale ID: <span className="font-mono text-foreground">#{history.recordId}</span>
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 text-[var(--accent-text)]" />
              <span>{history.saleDate.toLocaleDateString()}</span>
              <Clock className="w-4 h-4 text-[var(--accent-text)] ml-2" />
              <span>
                {history.saleDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
              Completed
            </Badge>
            <Badge variant="outline">
              {history.itemCount} item{history.itemCount === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Appointment</p>
            <p className="text-foreground font-medium">
              {history.appointmentId ? `#${history.appointmentId}` : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Staff</p>
            <p className="text-foreground font-medium">{staffName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total</p>
            <p className="text-foreground font-semibold text-[var(--accent-text)]">
              {formatCurrency(history.totalAmount)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {history.serviceItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--accent-text)]" />
                Services
              </p>
              {history.serviceItems.map((item, index) => (
                <div
                  key={`${history.recordId}-service-${index}`}
                  className="flex items-center justify-between rounded-md border border-[var(--glass-border)] px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="text-foreground font-medium">{item.name || "Service"}</p>
                    <p className="text-muted-foreground text-xs">
                      Qty: {item.quantity} • Unit: {formatCurrency(item.unitPrice)} • Discount:{" "}
                      {item.discount || 0}%
                    </p>
                  </div>
                  <p className="text-foreground font-medium">
                    {formatCurrency(
                      item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}

          {history.productItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-[var(--accent-text)]" />
                Products
              </p>
              {history.productItems.map((item, index) => (
                <div
                  key={`${history.recordId}-product-${index}`}
                  className="flex items-center justify-between rounded-md border border-[var(--glass-border)] px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="text-foreground font-medium">{item.name || "Product"}</p>
                    <p className="text-muted-foreground text-xs">
                      Qty: {item.quantity}
                      {item.unit ? ` ${item.unit}` : ""} • Unit: {formatCurrency(item.unitPrice)} •
                      Discount: {item.discount || 0}%
                    </p>
                  </div>
                  <p className="text-foreground font-medium">
                    {formatCurrency(
                      item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
