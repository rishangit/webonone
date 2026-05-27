import { Card } from "@/components/ui/card";
import { CardGridKebabSlot } from "@/components/common/CardGridKebabSlot";
import { LIST_CARD_GRID_SHELL } from "@/components/common/CardKebabTrigger";
import { CARD_PRICE_OVERLAY_TEXT_CLASS } from "@/components/common/ListCardLayout";
import { ServiceViewProps } from "../types";
import { ServiceImage } from "./ServiceImage";
import { ServiceStatus } from "./ServiceStatus";
import { ServiceActions } from "./ServiceActions";
import { ServiceTags } from "./ServiceTags";
import { ServiceInfo } from "./ServiceInfo";
import { useAppSelector } from "@/store/hooks";
import { isRole, UserRole } from "@/shared/types/user";

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
      className={LIST_CARD_GRID_SHELL}
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
          <span className={CARD_PRICE_OVERLAY_TEXT_CLASS}>{formatPrice(service.price)}</span>
        </div>
        {!isRegularUser && (
          <CardGridKebabSlot>
            <ServiceActions
              service={service}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onArchive={onArchive}
            />
          </CardGridKebabSlot>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-1">{service.name}</h3>
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
