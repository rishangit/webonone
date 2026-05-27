import { Card } from "@/components/ui/card";
import { LIST_CARD_LIST_SHELL } from "@/components/common/CardKebabTrigger";
import {
  ListCardContent,
  ListCardDetailsHeader,
  ListCardMediaColumn,
  ListCardPriceFooter,
} from "@/components/common/ListCardLayout";
import { ServiceViewProps } from "../types";
import { ServiceImage } from "./ServiceImage";
import { ServiceStatus } from "./ServiceStatus";
import { ServiceActions } from "./ServiceActions";
import { ServiceTags } from "./ServiceTags";
import { ServiceInfo } from "./ServiceInfo";
import { useAppSelector } from "@/store/hooks";
import { isRole, UserRole } from "@/shared/types/user";

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
  const isRegularUser = user && !isRole(user.role, UserRole.COMPANY_OWNER) && !isRole(user.role, UserRole.SYSTEM_ADMIN);

  const hasTags = (service.tags?.length ?? 0) > 0;

  return (
    <Card
      className={LIST_CARD_LIST_SHELL}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, [role="menuitem"]')) {
          return;
        }
        onView(service);
      }}
    >
      <ListCardMediaColumn>
        <ServiceImage imageUrl={getImageUrl(service)} serviceName={service.name} variant="list" />
      </ListCardMediaColumn>

      <ListCardContent>
        <ListCardDetailsHeader
          title={service.name}
          description={service.description}
          status={
            <ServiceStatus status={service.status} getStatusColor={getStatusColor} variant="list" />
          }
          actions={
            !isRegularUser ? (
              <ServiceActions
                service={service}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onArchive={onArchive}
                triggerVariant="default"
              />
            ) : undefined
          }
          tags={hasTags ? <ServiceTags tags={service.tags || []} variant="list" /> : undefined}
        />

        <ServiceInfo service={service} formatPrice={formatPrice} formatDuration={formatDuration} variant="list" />

        <ListCardPriceFooter label={formatPrice(service.price)} />
      </ListCardContent>
    </Card>
  );
};
