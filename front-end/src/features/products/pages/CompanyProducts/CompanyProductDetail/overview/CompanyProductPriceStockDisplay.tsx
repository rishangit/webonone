import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCompanyRequest } from "@/shared/store/companies";
import { companiesService } from "@/shared/services/companies-public";
import { currenciesService, Currency } from "@/shared/services/currencies";
import { formatPrice } from "@/features/products/pages/Variants/VariantStockDetailsPage/utils";
import type { CompanyProductVariant } from "@/features/products/services/companyProductVariants";

interface CompanyProductPriceStockDisplayProps {
  selectedVariant: CompanyProductVariant | null;
  companyId?: string | null;
}

export const CompanyProductPriceStockDisplay = ({
  selectedVariant,
  companyId,
}: CompanyProductPriceStockDisplayProps) => {
  const dispatch = useAppDispatch();
  const { companies } = useAppSelector((state) => state.companies);
  const [currency, setCurrency] = useState<Currency | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadCurrency = async () => {
      try {
        const idStr = companyId ? String(companyId) : "";
        if (!idStr) {
          const currencies = await currenciesService.getCurrencies();
          const usd = currencies.find((c) => c.name === "USD") ?? null;
          if (!cancelled) setCurrency(usd);
          return;
        }
        let company = companies.find((c) => String(c.id) === idStr);
        if (!company) {
          try {
            company = await companiesService.getCompanyById(idStr);
            dispatch(fetchCompanyRequest(idStr));
          } catch {
            // fall through to defaults below
          }
        }
        const currencyId = (company as { currencyId?: string } | undefined)?.currencyId;
        if (currencyId) {
          try {
            const c = await currenciesService.getCurrency(currencyId);
            if (!cancelled) setCurrency(c);
            return;
          } catch {
            // fall through to default
          }
        }
        const currencies = await currenciesService.getCurrencies();
        const usd = currencies.find((c) => c.name === "USD") ?? null;
        if (!cancelled) setCurrency(usd);
      } catch {
        if (!cancelled) setCurrency(null);
      }
    };
    loadCurrency();
    return () => {
      cancelled = true;
    };
  }, [companyId, companies, dispatch]);

  const fmt = (price: number | undefined | null) => formatPrice(price ?? 0, currency);

  if (!selectedVariant) {
    return (
      <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <h3 className="font-semibold text-foreground mb-4">Price & Stock</h3>
        <p className="text-sm text-muted-foreground">
          Select a variant to view its price and stock.
        </p>
      </Card>
    );
  }

  const stock = selectedVariant.activeStock;
  const quantity = stock?.quantity ?? 0;
  const min = selectedVariant.minStock;
  const max = selectedVariant.maxStock;
  const percent = max && max > 0 ? Math.min((quantity / max) * 100, 100) : 0;
  const lowStock = min !== undefined && quantity > 0 && quantity < min;
  const outOfStock = quantity === 0;
  const hasStockEntry = !!stock;

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <h3 className="font-semibold text-foreground mb-4">Price & Stock</h3>

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-muted-foreground">Cost Price</Label>
            <span className="text-foreground">
              {hasStockEntry ? fmt(stock?.costPrice) : <span className="text-muted-foreground italic">Not set</span>}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label className="text-muted-foreground">Sell Price</Label>
            <span className="text-foreground">
              {hasStockEntry && stock?.sellPrice != null ? (
                fmt(stock.sellPrice)
              ) : (
                <span className="text-muted-foreground italic">Not set</span>
              )}
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-muted-foreground">Active Stock</Label>
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold ${
                  outOfStock
                    ? "text-[oklch(0.637_0.237_25.331)]"
                    : "text-[var(--accent-primary)]"
                }`}
              >
                {quantity}
              </span>
              {outOfStock ? (
                <Badge className="bg-[oklch(0.637_0.237_25.331)]/15 text-[oklch(0.637_0.237_25.331)] border-[oklch(0.637_0.237_25.331)]/30 text-xs">
                  Out of stock
                </Badge>
              ) : lowStock ? (
                <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 text-xs">
                  Low stock
                </Badge>
              ) : null}
            </div>
          </div>

          {max !== undefined && max > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>
                  {quantity} / {max}
                </span>
                <span>{Math.round(percent)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${
                    outOfStock
                      ? "bg-[oklch(0.637_0.237_25.331)]"
                      : lowStock
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}

          {(min !== undefined || max !== undefined) && (
            <div className="grid grid-cols-2 gap-3">
              {min !== undefined && (
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-muted-foreground">Min</Label>
                  <span className="text-foreground">{min}</span>
                </div>
              )}
              {max !== undefined && (
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-muted-foreground">Max</Label>
                  <span className="text-foreground">{max}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
