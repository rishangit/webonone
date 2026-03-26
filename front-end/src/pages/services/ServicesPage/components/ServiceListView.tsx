import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceViewProps } from "../types";
import { ServiceImage } from "./ServiceImage";
import { ServiceStatus } from "./ServiceStatus";
import { ServiceActions } from "./ServiceActions";
import { ServiceTags } from "./ServiceTags";
import { ServiceInfo } from "./ServiceInfo";
import { useAppSelector } from "@/store/hooks";
import { isRole, UserRole } from "@/types/user";

export const ServiceListView = ({
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
      className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] cursor-pointer"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, [role="menuitem"]')) {
          return;
        }
        onView(service);
      }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 relative">
          <ServiceImage 
            imageUrl={getImageUrl(service)} 
            serviceName={service.name}
            variant="list"
          />
          <div className="absolute top-1 right-1">
            <ServiceStatus 
              status={service.status} 
              getStatusColor={getStatusColor}
              variant="list"
            />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground mb-1">{service.name}</h3>
              {service.category && (
                <p className="text-[var(--accent-text)] text-sm mb-2">{service.category}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] px-3 py-1 font-semibold">
                {formatPrice(service.price)}
              </Badge>
              {!isRegularUser && (
                <ServiceActions
                  service={service}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onArchive={onArchive}
                />
              )}
            </div>
          </div>
          
          <ServiceInfo 
            service={service}
            formatPrice={formatPrice}
            formatDuration={formatDuration}
            variant="list"
          />
          
          {service.description && (
            <p className="text-sm text-foreground mb-3 line-clamp-1">{service.description}</p>
          )}
          
          <ServiceTags tags={service.tags || []} />
        </div>
      </div>
    </Card>
  );
};
