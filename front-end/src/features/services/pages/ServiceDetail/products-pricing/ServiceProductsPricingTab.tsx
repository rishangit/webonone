import { Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import type { Service } from "@/features/services/services";
import type { CompanyProduct } from "@/shared/services/products-company-public";
import { getCompanyProductDefaultUnitPrice } from "@/features/services/utils/serviceProductPricing";
import { formatAvatarUrl } from "@/shared/utils";

interface ServiceProductsPricingTabProps {
  service: Service;
  companyProducts: CompanyProduct[];
  formatCurrency: (amount: number) => string;
}

export function ServiceProductsPricingTab({ service, companyProducts, formatCurrency }: ServiceProductsPricingTabProps) {
  const rows = service.defaultProducts || [];

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products linked"
        description="Add default products from the service wizard under Products & pricing."
        className="!p-8 border border-[var(--glass-border)] bg-[var(--glass-bg)]"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rows.map((row, index) => {
        const product = companyProducts.find((p) => p.id === row.companyProductId);
        const unit = product ? getCompanyProductDefaultUnitPrice(product) : 0;
        const line = unit * (Number(row.quantity) || 1);
        const img = product?.imageUrl ? formatAvatarUrl(product.imageUrl) : undefined;
        return (
          <Card key={`${row.companyProductId}-${index}`} className="p-4 border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm">
            <div className="flex gap-3">
              <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden border border-[var(--glass-border)] bg-muted">
                {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 m-auto text-muted-foreground" />}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="font-medium text-foreground truncate">{product?.name || row.companyProductId}</div>
                <div className="text-xs text-muted-foreground">Qty {row.quantity}</div>
                <div className="text-sm text-muted-foreground">Unit {formatCurrency(unit)}</div>
                <div className="text-sm font-semibold text-[var(--accent-text)]">Line {formatCurrency(line)}</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
