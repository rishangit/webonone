import { Service as ServiceType } from "../../../services/services";

export interface ServiceCardProps {
  service: ServiceType;
  onView: (service: ServiceType) => void;
  onEdit: (service: ServiceType) => void;
  onDelete: (service: ServiceType) => void;
  onDuplicate: (service: ServiceType) => void;
  onArchive: (service: ServiceType) => void;
  formatPrice: (price: number) => string;
  formatDuration: (minutes: number) => string;
  getImageUrl: (service: ServiceType) => string;
  getStatusColor: (status: string) => string;
  viewMode?: "grid" | "list";
}

export interface ServiceViewProps {
  service: ServiceType;
  onView: (service: ServiceType) => void;
  onEdit: (service: ServiceType) => void;
  onDelete: (service: ServiceType) => void;
  onDuplicate: (service: ServiceType) => void;
  onArchive: (service: ServiceType) => void;
  formatPrice: (price: number) => string;
  formatDuration: (minutes: number) => string;
  getImageUrl: (service: ServiceType) => string;
  getStatusColor: (status: string) => string;
}

export interface ServiceImageProps {
  imageUrl: string;
  serviceName: string;
  variant?: "grid" | "list";
}

export interface ServiceStatusProps {
  status: string;
  getStatusColor: (status: string) => string;
  variant?: "grid" | "list";
}

export interface ServiceActionsProps {
  service: ServiceType;
  onView: (service: ServiceType) => void;
  onEdit: (service: ServiceType) => void;
  onDelete: (service: ServiceType) => void;
  onDuplicate: (service: ServiceType) => void;
  onArchive: (service: ServiceType) => void;
}

export interface ServiceTagsProps {
  tags: any[];
  renderTags: (tags: any[]) => React.ReactNode;
}

export interface ServiceInfoProps {
  service: ServiceType;
  formatPrice: (price: number) => string;
  formatDuration: (minutes: number) => string;
  variant?: "grid" | "list";
}
