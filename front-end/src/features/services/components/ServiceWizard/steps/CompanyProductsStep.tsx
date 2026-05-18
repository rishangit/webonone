import { useMemo, useState } from "react";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartItemEditorCard } from "@/components/common/CartItemEditorCard";
import {
  ProductServiceSelectionDialog,
  type ProductSelectionItem,
} from "@/components/common/ProductServiceSelectionDialog";
import { EmptyState } from "@/components/common/EmptyState";
import type { CompanyProduct } from "@/features/products/services/productApi";
import type { DefaultProductRow } from "../types";
import { SERVICE_WIZARD_INPUT_SURFACE } from "../constants";
import { getCompanyProductDefaultUnitPrice, type CompanyProductWithVariants } from "@/features/services/utils/serviceProductPricing";
import { formatAvatarUrl } from "@/shared/utils";

export interface CompanyProductsStepProps {
  availableProducts: CompanyProduct[];
  duration: string;
  price: string;
  totals: {
    rows: Array<{
      row: DefaultProductRow;
      product: CompanyProduct | undefined;
      unitPrice: number;
      rowTotal: number;
    }>;
    productsTotal: number;
  };
  onAppendProduct: (companyProductId: string) => void;
  onUpdateDefaultProduct: (index: number, patch: Partial<DefaultProductRow>) => void;
  onRemoveDefaultProduct: (index: number) => void;
  onDurationChange: (v: string) => void;
  onPriceChange: (v: string) => void;
  formatCurrency?: (amount: number) => string;
}

function mapToSelectionItems(products: CompanyProduct[]): ProductSelectionItem[] {
  type VariantRow = { activeStock?: { sellPrice?: number | null; quantity?: number } };
  return products.map((raw) => {
    const p = raw as CompanyProductWithVariants;
    const variants = (p.variants || []) as VariantRow[];
    const inStock = variants.reduce((sum, v) => sum + Number(v.activeStock?.quantity ?? 0), 0);
    const price = getCompanyProductDefaultUnitPrice(p);
    const img = p.imageUrl ? formatAvatarUrl(p.imageUrl) : undefined;
    return {
      id: p.id,
      name: p.name || "Product",
      description: p.description || "",
      price,
      inStock,
      image: img,
    };
  });
}

export function CompanyProductsStep({
  availableProducts,
  duration,
  price,
  totals,
  onAppendProduct,
  onUpdateDefaultProduct,
  onRemoveDefaultProduct,
  onDurationChange,
  onPriceChange,
  formatCurrency = (amount: number) => (Number(amount) || 0).toFixed(2),
}: CompanyProductsStepProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const linkedIds = useMemo(() => totals.rows.map((r) => r.row.companyProductId), [totals.rows]);

  const selectionProducts = useMemo(() => mapToSelectionItems(availableProducts), [availableProducts]);

  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    totals.rows.forEach((entry, idx) => {
      map.set(entry.row.companyProductId, idx);
    });
    return map;
  }, [totals.rows]);

  const handleSelectFromDialog = (item: ProductSelectionItem) => {
    onAppendProduct(item.id);
    setPickerOpen(false);
  };

  const servicePriceNum = Number(price) || 0;
  const serviceTotal = totals.productsTotal + servicePriceNum;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Label className="flex items-center gap-2 text-foreground">
          <Package className="w-4 h-4" /> Products used for this service
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-[var(--glass-border)] h-9"
          onClick={() => setPickerOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add product
        </Button>
      </div>

      <ProductServiceSelectionDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        products={selectionProducts}
        services={[]}
        selectionMode="productsOnly"
        excludeProductIds={linkedIds}
        onSelectProduct={handleSelectFromDialog}
        onSelectService={() => {}}
        formatCurrency={formatCurrency}
        title="Select product"
        description="Choose a company product linked to this service."
      />

      {totals.rows.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products linked yet"
          description='Click "Add product" to link a company product to this service.'
          className="!p-6 border border-dashed border-[var(--glass-border)] bg-[var(--glass-bg)]"
        />
      ) : (
        <div className="space-y-3">
          {totals.rows.map(({ row, product, unitPrice }) => {
            const idx = indexById.get(row.companyProductId) ?? 0;
            const productName = product?.name || "Product";
            const productImage = product?.imageUrl ? formatAvatarUrl(product.imageUrl) : undefined;
            return (
              <CartItemEditorCard
                key={row.companyProductId}
                id={row.companyProductId}
                type="product"
                name={productName}
                description={product?.description}
                image={productImage}
                quantity={row.quantity}
                unitPrice={unitPrice}
                discount={row.discount ?? 0}
                formatCurrency={formatCurrency}
                onRemove={() => onRemoveDefaultProduct(idx)}
                onQuantityChange={(_id, qty) => onUpdateDefaultProduct(idx, { quantity: qty })}
                onDiscountChange={(_id, disc) => {
                  const clamped = Math.max(0, Math.min(100, Number(disc) || 0));
                  onUpdateDefaultProduct(idx, { discount: clamped });
                }}
                quantityMin={0}
              />
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-foreground">Service duration (minutes) *</Label>
          <Input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => onDurationChange(e.target.value)}
            className={SERVICE_WIZARD_INPUT_SURFACE}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Service price *</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            className={SERVICE_WIZARD_INPUT_SURFACE}
          />
        </div>
      </div>

      <div className="rounded-lg p-4 border border-[var(--glass-border)] bg-[var(--glass-bg)] space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Products subtotal</span>
          <span className="text-foreground font-medium">{formatCurrency(totals.productsTotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Service price</span>
          <span className="text-foreground font-medium">{formatCurrency(servicePriceNum)}</span>
        </div>
        <div className="border-t border-[var(--glass-border)] pt-2 flex items-center justify-between">
          <span className="text-sm text-foreground font-semibold">Service total</span>
          <span className="text-lg font-bold text-[var(--accent-text)]">{formatCurrency(serviceTotal)}</span>
        </div>
      </div>
    </div>
  );
}
