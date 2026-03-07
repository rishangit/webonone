import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { ServiceViewProps } from "../types";
import { ServiceImage } from "./ServiceImage";
import { ServiceStatus } from "./ServiceStatus";
import { ServiceActions } from "./ServiceActions";
import { ServiceTags } from "./ServiceTags";
import { ServiceInfo } from "./ServiceInfo";
import { useAppSelector } from "../../../../store/hooks";
import { isRole, UserRole } from "../../../../types/user";

export const ServiceCardView = ({
  service,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  formatPrice,
  formatDuration,
  getImageUrl,
  getStatusColor,
}: ServiceViewProps) => {
  const { user } = useAppSelector((state) => state.auth);
  // Check if user is a regular user (not company owner or admin)
  const isRegularUser = user && !isRole(user.role, UserRole.COMPANY_OWNER) && !isRole(user.role, UserRole.SYSTEM_ADMIN);

  return (
    <Card 
      className="overflow-hidden backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] group cursor-pointer"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, [role="menuitem"]')) {
          return;
        }
        onView(service);
      }}
    >
      <div className="relative">
        <ServiceImage 
          imageUrl={getImageUrl(service)} 
          serviceName={service.name}
          variant="grid"
        />
        <div className="absolute top-3 left-3">
          <ServiceStatus 
            status={service.status} 
            getStatusColor={getStatusColor}
            variant="grid"
          />
        </div>
        <div className="absolute bottom-3 right-3">
          <Badge className="bg-black/70 text-white backdrop-blur-sm border border-white/20 px-3 py-1.5 font-semibold">
            {formatPrice(service.price)}
          </Badge>
        </div>
        {!isRegularUser && (
          <div className="absolute top-3 right-3">
            <ServiceActions
              service={service}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onArchive={onArchive}
            />
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-1">{service.name}</h3>
            {service.category && (
              <p className="text-[var(--accent-text)] text-sm">{service.category}</p>
            )}
          </div>
        </div>

        {service.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
        )}

        <ServiceInfo 
          service={service}
          formatPrice={formatPrice}
          formatDuration={formatDuration}
          variant="grid"
        />

        <ServiceTags tags={service.tags || []} />
      </div>
    </Card>
  );
};
