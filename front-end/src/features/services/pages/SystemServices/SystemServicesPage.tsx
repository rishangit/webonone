import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Stethoscope, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearSystemServicesError,
  createSystemServiceRequest,
  deleteSystemServiceRequest,
  fetchSystemServicesRequest,
  updateSystemServiceRequest,
} from "@/features/services/store";
import type { CreateSystemServiceData, SystemService } from "@/features/services/services/systemServices";
import { ServiceCatalogSearchCard, SystemServiceWizardDialog } from "@/features/services/components";
import { SystemServiceCard } from "./SystemServiceCard";

export const SystemServicesPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { services, loading, error, pagination } = useAppSelector((state) => state.systemServices);
  const { user } = useAppSelector((state) => state.auth);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState<"create" | "edit">("create");
  const [selectedService, setSelectedService] = useState<SystemService | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<SystemService | null>(null);

  useEffect(() => {
    const filters = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchTerm || undefined,
      isActive: statusFilter === "all" ? undefined : statusFilter === "active",
    };
    dispatch(fetchSystemServicesRequest(filters));
  }, [dispatch, currentPage, itemsPerPage, debouncedSearchTerm, statusFilter]);

  useEffect(() => {
    if (error) {
      dispatch(clearSystemServicesError());
    }
  }, [dispatch, error]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  const totalServices = pagination?.total || services.length;
  const activeCount = useMemo(() => services.filter((item) => item.isActive).length, [services]);
  const usageCount = useMemo(
    () => services.reduce((sum, item) => sum + Number(item.usageCount || 0), 0),
    [services]
  );

  const openCreateDialog = () => {
    setWizardMode("create");
    setSelectedService(null);
    setIsWizardOpen(true);
  };

  const openEditDialog = (service: SystemService) => {
    setWizardMode("edit");
    setSelectedService(service);
    setIsWizardOpen(true);
  };

  const openViewDetail = (service: SystemService) => {
    navigate(`/system/system-services/${service.id}`);
  };

  const handleWizardSave = (payload: CreateSystemServiceData) => {
    if (wizardMode === "edit" && selectedService) {
      dispatch(updateSystemServiceRequest({ id: selectedService.id, data: payload }));
    } else {
      dispatch(createSystemServiceRequest(payload));
    }
  };

  const handleDeleteClick = (service: SystemService) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!serviceToDelete) return;
    dispatch(deleteSystemServiceRequest(serviceToDelete.id));
    setIsDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const hasActiveFilters = Boolean(debouncedSearchTerm || statusFilter !== "all");

  return (
    <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">System Services</h1>
            <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Super Admin
            </Badge>
          </div>
          <p className="text-muted-foreground">Manage shared services available to all companies.</p>
        </div>
        <Button onClick={openCreateDialog} variant="accent" disabled={!user}>
          <Plus className="w-4 h-4 mr-2" />
          Add System Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <p className="text-sm text-muted-foreground">Total Services</p>
          <p className="text-xl font-semibold text-foreground">{totalServices}</p>
        </Card>
        <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <p className="text-sm text-muted-foreground">Active Services</p>
          <p className="text-xl font-semibold text-foreground">{activeCount}</p>
        </Card>
        <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <p className="text-sm text-muted-foreground">Total Usage</p>
          <p className="text-xl font-semibold text-foreground">{usageCount}</p>
        </Card>
      </div>

      <ServiceCatalogSearchCard
        searchPlaceholder="Search system services..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onDebouncedSearchChange={setDebouncedSearchTerm}
        filterActive={hasActiveFilters}
        onFilterClick={() => setIsFilterOpen((prev) => !prev)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      >
        {isFilterOpen && (
          <div className="border-t border-[var(--glass-border)] pt-4">
            <div className="max-w-xs space-y-2">
              <Label className="text-foreground">Status</Label>
              <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
                <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </ServiceCatalogSearchCard>

      <div className="flex-1 min-h-0">
        {services.length === 0 && !loading ? (
          <EmptyState
            icon={Stethoscope}
            title="No system services found"
            description={
              hasActiveFilters ? "No services match your search/filter criteria." : "Start building the reusable system service pool."
            }
            action={{
              label: "Create system service",
              onClick: openCreateDialog,
              variant: "accent",
              icon: Plus,
            }}
          />
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-4"}>
            {services.map((service) => (
              <SystemServiceCard
                key={service.id}
                service={service}
                viewMode={viewMode}
                onView={openViewDetail}
                onEdit={openEditDialog}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {pagination && pagination.total > 0 && (
        <div className="mt-4">
          <Pagination
            totalItems={pagination.total}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            showItemsPerPageSelector={true}
            itemsPerPageOptions={[20, 50, 100]}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      <SystemServiceWizardDialog
        open={isWizardOpen}
        onOpenChange={(open) => {
          setIsWizardOpen(open);
          if (!open) setSelectedService(null);
        }}
        mode={wizardMode}
        initialService={wizardMode === "edit" ? selectedService : null}
        onSave={handleWizardSave}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemType="System Service"
        itemName={serviceToDelete?.name}
        isLoading={loading}
      />
    </div>
  );
};
