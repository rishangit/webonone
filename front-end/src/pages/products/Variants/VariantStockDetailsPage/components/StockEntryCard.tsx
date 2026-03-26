import { MoreVertical, Edit, Trash2, CheckCircle, Calendar, Building2, Hash, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DateDisplay } from "@/components/common/DateDisplay";
import { StockEntryCardProps } from "../types";

export const StockEntryCard = ({
  entry,
  variant,
  formatPrice,
  onEdit,
  onDelete,
  onSetAsActive,
}: StockEntryCardProps) => {
  const isActive = variant?.activeStockId === entry.id;

  return (
    <div
      className={`relative p-4 bg-[var(--input-background)] border rounded-lg hover:bg-[var(--accent-bg)]/50 transition-colors ${
        isActive
          ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20 bg-[var(--accent-bg)]/30' 
          : 'border-[var(--glass-border)]'
      }`}
    >
      <div className="absolute top-3 right-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-[var(--accent-bg)]"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--accent-border)]/30"
          >
            {!isActive && (
              <DropdownMenuItem
                onClick={() => onSetAsActive(entry.id)}
                className="hover:bg-[var(--accent-bg)]"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Set as Active
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onEdit(entry)}
              className="hover:bg-[var(--accent-bg)]"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(entry.id)}
              className="text-red-600 dark:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-start justify-between gap-4 pr-10">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
              {entry.quantity} units
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {entry.purchaseDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Purchase:</span>
                <span className="text-foreground">
                  <DateDisplay date={entry.purchaseDate} />
                </span>
              </div>
            )}
            {entry.expiryDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Expiry:</span>
                <span className="text-foreground">
                  <DateDisplay date={entry.expiryDate} />
                </span>
              </div>
            )}
            {entry.supplier && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Supplier:</span>
                <span className="text-foreground">
                  {entry.supplier.firstName || ''} {entry.supplier.lastName || ''} {entry.supplier.email ? `(${entry.supplier.email})` : ''}
                </span>
              </div>
            )}
            {entry.batchNumber && (
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Batch:</span>
                <span className="text-foreground">{entry.batchNumber}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              Added <DateDisplay date={entry.createdAt} fallback="N/A" />
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-[120px] justify-end">
            <span className="text-xs text-muted-foreground">Cost:</span>
            <span className="text-lg font-semibold text-[var(--accent-primary)]">
              {formatPrice(entry.costPrice)}
            </span>
          </div>
          
          {entry.sellPrice !== null && entry.sellPrice !== undefined && (
            <div className="flex items-center gap-2 min-w-[120px] justify-end">
              <span className="text-xs text-muted-foreground">Sell:</span>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                {formatPrice(entry.sellPrice)}
              </span>
            </div>
          )}
          
          {isActive && (
            <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
              Active Stock
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
