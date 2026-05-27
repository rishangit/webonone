import { useCallback, useEffect, useMemo, useState } from "react";
import { Stethoscope, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/ui/button";
import { TabSwitcher } from "@/components/ui/tab-switcher";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { currenciesService, type Currency } from "@/shared/services/currencies";
import { isRole, UserRole } from "@/shared/types/user";
import { useAppSelector } from "@/store/hooks";
import type { Service } from "@/features/services/services";
import { systemServicesService, type SystemService, type CreateSystemServiceData } from "@/features/services/services/systemServices";
import { SystemServiceWizardDialog } from "@/features/services/components";
import { mapSystemServiceToServiceDetailView } from "@/features/services/utils/mapSystemServiceToServiceDetailView";
import { ServiceDetailHeader } from "@/features/services/pages/ServiceDetail/ServiceDetailHeader";
import { ServiceDetailTabToolbar } from "@/features/services/pages/ServiceDetail/ServiceDetailTabToolbar";
import { ServiceOverviewTab } from "@/features/services/pages/ServiceDetail/overview/ServiceOverviewTab";
import { ServiceStatisticsTab } from "@/features/services/pages/ServiceDetail/statistics/ServiceStatisticsTab";
import { ServiceBasicTab } from "@/features/services/pages/ServiceDetail/basic/ServiceBasicTab";
import { ServiceGalleryTab } from "@/features/services/pages/ServiceDetail/gallery/ServiceGalleryTab";
import { ServiceProductsPricingTab } from "@/features/services/pages/ServiceDetail/products-pricing/ServiceProductsPricingTab";

interface SystemServiceDetailPageProps {
  serviceId: string;
  onBack: () => void;
}

export const SystemServiceDetailPage = ({ serviceId, onBack }: SystemServiceDetailPageProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const { companies, currentCompany } = useAppSelector((state) => state.companies);
  const isSystemAdmin = isRole(user?.role, UserRole.SYSTEM_ADMIN);
  /** System catalog wizard only allows {@link UserRole.SYSTEM_ADMIN}; match that for edit/delete UI. */
  const canManageSystemService = isSystemAdmin;

  const [systemService, setSystemService] = useState<SystemService | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);
  const [editWizardOpen, setEditWizardOpen] = useState(false);
  const [editWizardStep, setEditWizardStep] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const serviceView = useMemo(
    () => (systemService ? mapSystemServiceToServiceDetailView(systemService) : null),
    [systemService]
  );

  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true);
        const data = await systemServicesService.getSystemServiceById(serviceId);
        setSystemService(data);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load system service details";
        toast.error(message);
        setSystemService(null);
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [serviceId]);

  useEffect(() => {
    const fetchCompanyCurrency = async () => {
      const companyId = user?.companyId;

      if (!companyId) {
        try {
          const currencies = await currenciesService.getCurrencies();
          setCompanyCurrency(currencies.find((c) => c.name === "USD") || null);
        } catch {
          setCompanyCurrency(null);
        }
        return;
      }

      try {
        let company = companies.find((c) => String(c.id) === String(companyId)) || currentCompany;

        if (!company || String(company.id) !== String(companyId)) {
          try {
            const { companiesService } = await import("@/shared/services/companies-public");
            company = await companiesService.getCompanyById(String(companyId));
          } catch {
            /* ignore */
          }
        }

        const currencyId = company?.currencyId;

        if (currencyId) {
          try {
            const currency = await currenciesService.getCurrency(currencyId);
            setCompanyCurrency(currency);
          } catch {
            const currencies = await currenciesService.getCurrencies();
            setCompanyCurrency(currencies.find((c) => c.name === "USD") || null);
          }
        } else {
          try {
            const currencies = await currenciesService.getCurrencies();
            setCompanyCurrency(currencies.find((c) => c.name === "USD") || null);
          } catch {
            setCompanyCurrency(null);
          }
        }
      } catch {
        try {
          const currencies = await currenciesService.getCurrencies();
          setCompanyCurrency(currencies.find((c) => c.name === "USD") || null);
        } catch {
          setCompanyCurrency(null);
        }
      }
    };

    fetchCompanyCurrency();
  }, [user?.companyId, companies, currentCompany]);

  const formatCurrency = (amount: number) => {
    const numPrice = Number(amount) || 0;
    if (isNaN(numPrice)) {
      return companyCurrency ? `${companyCurrency.symbol} ${(0).toFixed(companyCurrency.decimals || 2)}` : "$ 0.00";
    }
    if (companyCurrency) {
      const decimals = companyCurrency.decimals || 2;
      const roundedPrice = Math.round(numPrice / companyCurrency.rounding) * companyCurrency.rounding;
      const formattedNumber = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(roundedPrice);
      return `${companyCurrency.symbol} ${formattedNumber}`;
    }
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(numPrice);
    return formatted.replace("$", "$ ");
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hr${hours > 1 ? "s" : ""}`;
    }
    return `${hours} hr${hours > 1 ? "s" : ""} ${mins} min`;
  };

  const openEditWizard = useCallback((step: number) => {
    setEditWizardStep(step);
    setEditWizardOpen(true);
  }, []);

  const handleWizardSave = async (payload: CreateSystemServiceData) => {
    if (!systemService) return;
    try {
      const updated = await systemServicesService.updateSystemService(systemService.id, payload);
      setSystemService(updated);
      toast.success("System service updated successfully");
      setEditWizardOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update system service";
      toast.error(message);
    }
  };

  const persistGalleryImages = useCallback(
    async (images: string[]) => {
      if (!systemService) return;
      await systemServicesService.updateSystemService(systemService.id, { images });
    },
    [systemService]
  );

  const handleGalleryServiceUpdate = useCallback((updated: Service) => {
    setSystemService((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        images: updated.images?.length ? updated.images : prev.images,
        image: updated.image || prev.image,
      };
    });
  }, []);

  const handleDeleteService = async () => {
    if (!systemService) return;
    try {
      setDeleting(true);
      await systemServicesService.deleteSystemService(systemService.id);
      toast.success("System service deleted successfully");
      onBack();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete system service";
      toast.error(message);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading system service details...</p>
        </div>
      </div>
    );
  }

  if (!systemService || !serviceView) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <Stethoscope className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">System service not found</h3>
          <p className="text-muted-foreground mb-4">The system service you are looking for does not exist.</p>
          <BackButton onClick={onBack} />
        </div>
      </div>
    );
  }

  const galleryFolderPath = `system-services/${systemService.id}/gallery`;

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 w-full">
      <ServiceDetailHeader
        service={serviceView}
        isCompanyOwner={canManageSystemService}
        showDelete={canManageSystemService}
        onBack={onBack}
        onEdit={() => openEditWizard(0)}
        onDelete={() => setShowDeleteDialog(true)}
      />

      <div className="w-full space-y-6">
        <TabSwitcher
          tabs={[
            { value: "overview", label: "Overview" },
            { value: "statistics", label: "Statistics" },
            { value: "basic", label: "Basic" },
            { value: "gallery", label: "Gallery" },
            { value: "products", label: "Products & pricing" },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === "overview" && (
          <div className="mt-6">
            <ServiceDetailTabToolbar
              title="Overview"
              showMenu={canManageSystemService}
              onEditSection={() => openEditWizard(0)}
            />
            <ServiceOverviewTab
              service={serviceView}
              companyCurrency={companyCurrency}
              formatCurrency={formatCurrency}
              formatDuration={formatDuration}
              companyProducts={[]}
              showProductsPricingBreakdown={false}
            />
          </div>
        )}

        {activeTab === "statistics" && (
          <div className="mt-6">
            <ServiceDetailTabToolbar
              title="Statistics"
              showMenu={canManageSystemService}
              onEditSection={() => openEditWizard(0)}
            />
            <ServiceStatisticsTab
              service={serviceView}
              formatCurrency={formatCurrency}
              canViewPricingDetails={canManageSystemService}
            />
          </div>
        )}

        {activeTab === "basic" && (
          <div className="mt-6">
            <ServiceDetailTabToolbar
              title="Basic information"
              showMenu={canManageSystemService}
              onEditSection={() => openEditWizard(0)}
            />
            <ServiceBasicTab service={serviceView} formatCurrency={formatCurrency} formatDuration={formatDuration} />
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="mt-6">
            <ServiceDetailTabToolbar
              title="Gallery"
              showMenu={canManageSystemService}
              onEditSection={() => openEditWizard(1)}
            />
            <ServiceGalleryTab
              service={serviceView}
              companyId={undefined}
              canEditGallery={canManageSystemService}
              galleryUploadFolderPath={galleryFolderPath}
              persistGalleryImages={persistGalleryImages}
              onServiceUpdate={handleGalleryServiceUpdate}
            />
          </div>
        )}

        {activeTab === "products" && (
          <div className="mt-6">
            <ServiceDetailTabToolbar
              title="Products & pricing"
              showMenu={canManageSystemService}
              onEditSection={() => openEditWizard(2)}
            />
            <ServiceProductsPricingTab service={serviceView} companyProducts={[]} formatCurrency={formatCurrency} />
          </div>
        )}
      </div>

      <SystemServiceWizardDialog
        open={editWizardOpen}
        onOpenChange={setEditWizardOpen}
        mode="edit"
        initialService={systemService}
        initialStepIndex={editWizardStep}
        onSave={handleWizardSave}
      />

      <CustomDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete System Service"
        description={`Are you sure you want to delete "${systemService.name}"? This action cannot be undone.`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="default"
              className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="default"
              className="h-10"
              onClick={handleDeleteService}
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        }
      >
        <div />
      </CustomDialog>
    </div>
  );
};
