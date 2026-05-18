import { Clock, DollarSign, Tag as TagIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Service } from "@/features/services/services";
import { Currency } from "@/shared/services/currencies";
import type { CompanyProduct } from "@/features/products/services/productApi";
import { getCompanyProductDefaultUnitPrice } from "@/features/services/utils/serviceProductPricing";

interface ServiceDetailInfoProps {
  service: Service;
  companyCurrency: Currency | null;
  formatCurrency: (amount: number) => string;
  formatDuration: (minutes: number) => string;
  companyProducts?: CompanyProduct[];
  showProductsPricingBreakdown?: boolean;
  bookAppointmentTrigger?: React.ReactNode;
}

export const ServiceDetailInfo = ({
  service,
  companyCurrency: _companyCurrency,
  formatCurrency,
  formatDuration,
  companyProducts = [],
  showProductsPricingBreakdown = false,
  bookAppointmentTrigger,
}: ServiceDetailInfoProps) => {
  const productsSubtotal = (service.defaultProducts || []).reduce((sum, row) => {
    const product = companyProducts.find((item) => item.id === row.companyProductId);
    const quantity = Math.max(1, Number(row.quantity) || 1);
    const unitPrice = product ? getCompanyProductDefaultUnitPrice(product) : 0;
    const discount = Math.min(100, Math.max(0, Number(row.discount) || 0));
    const lineTotal = quantity * unitPrice * (1 - discount / 100);
    return sum + lineTotal;
  }, 0);
  const serviceTotal = productsSubtotal + (Number(service.price) || 0);

  return (
    <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] w-full">
      <div className="space-y-4 w-full">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2 break-words">{service.name}</h2>
          {service.description && (
            <p className="text-muted-foreground break-words">{service.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
            <span className="text-muted-foreground">Duration:</span>
            <span className="text-foreground font-medium">{formatDuration(service.duration)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
            <span className="text-muted-foreground">Price:</span>
            <span className="text-foreground font-semibold">{formatCurrency(service.price)}</span>
          </div>
        </div>

        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <TagIcon className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
            {service.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
              >
                {typeof tag === 'string' ? tag : tag.name}
              </Badge>
            ))}
          </div>
        )}

        {showProductsPricingBreakdown && (
          <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Products subtotal</span>
              <span className="font-medium text-foreground">{formatCurrency(productsSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Service price</span>
              <span className="font-medium text-foreground">{formatCurrency(service.price)}</span>
            </div>
            <div className="border-t border-[var(--glass-border)] pt-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Service total</span>
              <span className="text-base font-bold text-[var(--accent-text)]">{formatCurrency(serviceTotal)}</span>
            </div>
          </div>
        )}

        {bookAppointmentTrigger && (
          <div className="pt-2">
            {bookAppointmentTrigger}
          </div>
        )}
      </div>
    </Card>
  );
};
