import { ServiceCardProps } from "../types";
import { ServiceCardView } from "./ServiceCardView";
import { ServiceListView } from "./ServiceListView";

export const ServiceCard = ({
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
  viewMode = "grid",
}: ServiceCardProps) => {
  if (viewMode === "list") {
    return (
      <ServiceListView
        service={service}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onArchive={onArchive}
        formatPrice={formatPrice}
        formatDuration={formatDuration}
        getImageUrl={getImageUrl}
        getStatusColor={getStatusColor}
      />
    );
  }

  return (
    <ServiceCardView
      service={service}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onArchive={onArchive}
      formatPrice={formatPrice}
      formatDuration={formatDuration}
      getImageUrl={getImageUrl}
      getStatusColor={getStatusColor}
    />
  );
};
