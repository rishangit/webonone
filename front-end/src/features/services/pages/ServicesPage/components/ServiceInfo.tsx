import { Clock } from "lucide-react";
import {
  CARD_PRICE_TEXT_CLASS,
  ListCardDetailDivider,
  ListCardDetailField,
  ListCardDetailGrid,
} from "@/components/common/ListCardLayout";
import { ServiceInfoProps } from "../types";

export const ServiceInfo = ({ service, formatPrice, formatDuration, variant = "grid" }: ServiceInfoProps) => {
  if (variant === "list") {
    return (
      <>
        <ListCardDetailGrid>
          <ListCardDetailField
            icon={Clock}
            label="Duration"
            value={formatDuration(service.duration)}
          />
          <ListCardDetailField
            label="Bookings"
            value={`${service.bookings.thisMonth} this month`}
          />
          <ListCardDetailField label="Category" value={service.category ?? "—"} />
        </ListCardDetailGrid>
        <ListCardDetailDivider />
        <ListCardDetailGrid>
          <ListCardDetailField
            label="Revenue"
            value={formatPrice(service.bookings.revenue)}
            className="[&_span:last-child]:font-semibold [&_span:last-child]:text-[var(--accent-text)]"
          />
          <ListCardDetailField label="ID" value={service.id} />
        </ListCardDetailGrid>
      </>
    );
  }

  return (
    <div className="flex items-center gap-4 mb-4 text-sm">
      <div className="flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-[var(--accent-text)]" />
        <span className="text-foreground font-medium">{formatDuration(service.duration)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Price:</span>
        <span className={CARD_PRICE_TEXT_CLASS}>{formatPrice(service.price)}</span>
      </div>
    </div>
  );
};
