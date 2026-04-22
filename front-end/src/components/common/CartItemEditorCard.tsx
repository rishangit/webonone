import { FileText, Package, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CartItemEditorCardProps {
  id: string;
  type: "product" | "service";
  name: string;
  description?: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  unit?: string;
  variantVolume?: string;
  displayPrice?: number;
  formatCurrency: (amount: number) => string;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onDiscountChange: (id: string, discount: number) => void;
  quantityMin?: number;
}

export function CartItemEditorCard({
  id,
  type,
  name,
  description,
  image,
  quantity,
  unitPrice,
  discount,
  unit,
  variantVolume,
  displayPrice,
  formatCurrency,
  onRemove,
  onQuantityChange,
  onDiscountChange,
  quantityMin = 0,
}: CartItemEditorCardProps) {
  const displayedUnitPrice = variantVolume && displayPrice ? displayPrice : unitPrice;
  const totalPrice = (quantity * unitPrice) * (1 - discount / 100);

  return (
    <Card className="p-4 bg-[var(--glass-bg)] border border-[var(--accent-border)] backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 hover:border-[var(--accent-primary)]">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = "none";
                    const fallback = img.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ display: image ? "none" : "flex" }}
              >
                {type === "product" ? (
                  <Package className="w-6 h-6 text-muted-foreground" />
                ) : (
                  <FileText className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground text-sm truncate mb-1">{name}</h4>
              {description ? (
                <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
              ) : null}
              {variantVolume ? (
                <Badge
                  variant="outline"
                  className="text-xs bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent-text)] mt-1"
                >
                  Size: {variantVolume}
                </Badge>
              ) : null}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 h-7 w-7"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex flex-row gap-2 items-end">
          <div className="flex-1 space-y-1 min-w-0">
            <Label className="text-xs font-medium text-muted-foreground">Quantity</Label>
            <Input
              type="number"
              min={quantityMin}
              value={quantity}
              onChange={(e) => onQuantityChange(id, parseFloat(e.target.value) || quantityMin)}
              className="text-xs h-8 w-full bg-[var(--input-background)] border-[var(--glass-border)] hover:border-[var(--accent-border)] focus:border-[var(--accent-primary)] transition-colors"
            />
          </div>

          <div className="flex-1 space-y-1 min-w-0">
            <Label className="text-xs font-medium text-muted-foreground">
              {variantVolume ? `Price/${variantVolume}` : `Price${unit ? `/${unit}` : ""}`}
            </Label>
            <div className="text-xs font-semibold text-[var(--accent-text)] h-8 flex items-center w-full">
              {formatCurrency(displayedUnitPrice)}
            </div>
          </div>

          <div className="flex-1 space-y-1 min-w-0">
            <Label className="text-xs font-medium text-muted-foreground">Discount %</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => onDiscountChange(id, parseFloat(e.target.value) || 0)}
              className="text-xs h-8 w-full bg-[var(--input-background)] border-[var(--glass-border)] hover:border-[var(--accent-border)] focus:border-[var(--accent-primary)] transition-colors"
            />
          </div>

          <div className="flex-1 space-y-1 min-w-0 flex flex-col items-end">
            <Label className="text-xs font-medium text-muted-foreground w-full justify-end text-right">Total</Label>
            <div className="text-sm font-bold text-[var(--accent-text)] h-8 flex items-center justify-end w-full">
              {formatCurrency(totalPrice)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
