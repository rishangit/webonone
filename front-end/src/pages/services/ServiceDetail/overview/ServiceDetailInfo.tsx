import { Clock, DollarSign, Tag as TagIcon } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Service } from "../../../../services/services";
import { Currency } from "../../../../services/currencies";

interface ServiceDetailInfoProps {
  service: Service;
  companyCurrency: Currency | null;
  formatCurrency: (amount: number) => string;
  formatDuration: (minutes: number) => string;
}

export const ServiceDetailInfo = ({
  service,
  companyCurrency,
  formatCurrency,
  formatDuration,
}: ServiceDetailInfoProps) => {
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

        {(service.category || service.subcategory) && (
          <div className="flex flex-wrap gap-2">
            {service.category && (
              <Badge variant="outline" className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                {service.category}
              </Badge>
            )}
            {service.subcategory && (
              <Badge variant="outline" className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                {service.subcategory}
              </Badge>
            )}
          </div>
        )}

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
      </div>
    </Card>
  );
};
