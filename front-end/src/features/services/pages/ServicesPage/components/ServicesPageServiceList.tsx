import { Stethoscope, Filter, Plus } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import type { PaginationMeta, Service } from "@/features/services/services";
import type { ServiceCardProps } from "../types";
import { ServiceCard } from "./ServiceCard";

type ServiceListCallbacks = Pick<
  ServiceCardProps,
  | "formatPrice"
  | "formatDuration"
  | "getImageUrl"
  | "getStatusColor"
  | "onView"
  | "onEdit"
  | "onDelete"
  | "onDuplicate"
  | "onArchive"
>;

export interface ServicesPageServiceListProps extends ServiceListCallbacks {
  services: Service[];
  viewMode: "grid" | "list";
  isSuperAdmin: boolean;
  debouncedSearchTerm: string;
  filterCategory: string;
  filterStatus: string;
  pagination: PaginationMeta | null | undefined;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (n: number) => void;
  onAddService: () => void;
  onRefreshPage: () => void;
  /** When set, empty unfiltered list shows “Add system service” for super admins */
  onSuperAdminAddSystemService?: () => void;
}

export function ServicesPageServiceList({
  services,
  viewMode,
  isSuperAdmin,
  debouncedSearchTerm,
  filterCategory,
  filterStatus,
  pagination,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  formatPrice,
  formatDuration,
  getImageUrl,
  getStatusColor,
  onAddService,
  onRefreshPage,
  onSuperAdminAddSystemService,
}: ServicesPageServiceListProps) {
  if (services.length === 0) {
    const hasFilters = Boolean(debouncedSearchTerm || filterCategory !== "all" || filterStatus !== "all");
    const superAdminPrimaryAdd = isSuperAdmin && !hasFilters && onSuperAdminAddSystemService;

    return (
      <EmptyState
        icon={Stethoscope}
        title="No services found"
        description={
          hasFilters
            ? "Try adjusting your filters to see more services"
            : isSuperAdmin
              ? "No company services found yet"
              : "You haven't created any services yet"
        }
        action={{
          label: superAdminPrimaryAdd ? "Add system service" : isSuperAdmin ? "Refresh" : "Add Your First Service",
          onClick: superAdminPrimaryAdd ? onSuperAdminAddSystemService : isSuperAdmin ? onRefreshPage : onAddService,
          variant: "accent",
          icon: superAdminPrimaryAdd ? Plus : isSuperAdmin ? Filter : Plus,
        }}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
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
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
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
                viewMode="list"
              />
            ))}
          </div>
        )}
      </div>
      {pagination && pagination.total > 0 && (
        <div className="mt-auto pt-4">
          <Pagination
            totalItems={pagination.total}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={onPageChange}
            showItemsPerPageSelector={true}
            itemsPerPageOptions={[12, 24, 48, 96]}
            onItemsPerPageChange={(newItemsPerPage) => {
              onItemsPerPageChange(newItemsPerPage);
            }}
          />
        </div>
      )}
    </div>
  );
}
