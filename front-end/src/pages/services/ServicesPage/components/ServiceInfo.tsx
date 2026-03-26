import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ServiceInfoProps } from "../types";

export const ServiceInfo = ({ service, formatPrice, formatDuration, variant = "grid" }: ServiceInfoProps) => {
  if (variant === "list") {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-[var(--accent-text)]" />
            <span>Duration: <span className="text-foreground font-medium">{formatDuration(service.duration)}</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Bookings: <span className="text-foreground font-medium">{service.bookings.thisMonth}</span></span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="text-sm">
            <span className="text-muted-foreground">Revenue: </span>
            <span className="text-[var(--accent-text)] font-semibold">{formatPrice(service.bookings.revenue)}</span>
          </div>
        </div>
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
        <span className="text-[var(--accent-text)] font-semibold">{formatPrice(service.price)}</span>
      </div>
    </div>
  );
};
