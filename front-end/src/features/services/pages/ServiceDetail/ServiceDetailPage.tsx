import { useState, useEffect, useCallback } from "react";
import { CalendarPlus, Stethoscope } from "lucide-react";
import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/ui/button";
import { TabSwitcher } from "@/components/ui/tab-switcher";
import { servicesService, Service, type CreateServiceData } from "@/features/services/services";
import { currenciesService, type Currency } from "@/shared/services/currencies";
import { toast } from "sonner";
import { isRole, UserRole } from "@/shared/types/user";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchServiceRequest, updateServiceRequest } from "@/features/services/store";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { ServiceDetailHeader } from "./ServiceDetailHeader";
import { ServiceOverviewTab } from "./overview/ServiceOverviewTab";
import { ServiceGalleryTab } from "./gallery/ServiceGalleryTab";
import { ServiceStatisticsTab } from "./statistics/ServiceStatisticsTab";
import { ServiceBasicTab } from "./basic/ServiceBasicTab";
import { ServiceProductsPricingTab } from "./products-pricing/ServiceProductsPricingTab";
import { ServiceDetailTabToolbar } from "./ServiceDetailTabToolbar";
import { AppointmentWizard } from "@/shared/components/appointments";
import { ServiceWizardDialog } from "@/features/services/components";
import { companyProductsService, type CompanyProduct } from "@/features/products/services/productApi";

interface ServiceDetailPageProps {
  serviceId: string;
  onBack: () => void;
}

export const ServiceDetailPage = ({ serviceId, onBack }: ServiceDetailPageProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { companies, currentCompany } = useAppSelector((state) => state.companies);
  const { currentService } = useAppSelector((state) => state.services);
  const isCompanyOwner = isRole(user?.role, UserRole.COMPANY_OWNER);
  const isSystemAdmin = isRole(user?.role, UserRole.SYSTEM_ADMIN);
  const isStaffAdmin = isRole(user?.role, UserRole.STAFF_MEMBER);
  const isEndUser = isRole(user?.role, UserRole.USER);
  const canManageService = isCompanyOwner || isSystemAdmin || isStaffAdmin;
  const showOverviewProductTotals = isCompanyOwner || isEndUser;
  const canBookFromServicePage = !canManageService;

  const [service, setService] = useState<Service | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [companyProducts, setCompanyProducts] = useState<CompanyProduct[]>([]);
  const [editWizardOpen, setEditWizardOpen] = useState(false);
  const [editWizardStep, setEditWizardStep] = useState(0);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLocalLoading(true);
        dispatch(fetchServiceRequest(serviceId));
        const serviceData = await servicesService.getServiceById(serviceId);
        setService(serviceData);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load service details";
        toast.error(message);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchService();
  }, [serviceId, dispatch]);

  useEffect(() => {
    if (currentService && currentService.id === serviceId) {
      setService(currentService);
    }
  }, [currentService, serviceId]);

  useEffect(() => {
    const fetchCompanyCurrency = async () => {
      const companyId = user?.companyId || service?.companyId;

      if (!companyId) {
        try {
          const currencies = await currenciesService.getCurrencies();
          const usdCurrency = currencies.find((c) => c.name === "USD");
          setCompanyCurrency(usdCurrency || null);
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
  }, [user?.companyId, service?.companyId, companies, currentCompany]);

  useEffect(() => {
    const loadProducts = async () => {
      const cid = service?.companyId;
      if (!cid) {
        setCompanyProducts([]);
        return;
      }
      try {
        const result = await companyProductsService.getCompanyProducts({ companyId: cid, limit: 500, offset: 0 });
        const products = Array.isArray(result) ? result : result.products;
        setCompanyProducts(products);
      } catch {
        setCompanyProducts([]);
      }
    };
    loadProducts();
  }, [service?.companyId]);

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

  const handleDeleteService = async () => {
    if (!service) return;

    try {
      setDeleting(true);
      await servicesService.deleteService(service.id);
      toast.success("Service deleted successfully");
      onBack();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete service";
      toast.error(message);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const openEditWizard = useCallback((step: number) => {
    setEditWizardStep(step);
    setEditWizardOpen(true);
  }, []);

  const handleWizardSave = (payload: CreateServiceData) => {
    if (!service) return;
    dispatch(updateServiceRequest({ id: service.id, data: payload }));
    setEditWizardOpen(false);
  };

  if (localLoading) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <Stethoscope className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Service Not Found</h3>
          <p className="text-muted-foreground mb-4">The service you are looking for does not exist.</p>
          <BackButton onClick={onBack} />
        </div>
      </div>
    );
  }

  const companyId = user?.companyId || service?.companyId;

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 w-full">
      <ServiceDetailHeader
        service={service}
        isCompanyOwner={canManageService}
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
              showMenu={canManageService}
              onEditSection={() => openEditWizard(0)}
            />
            <ServiceOverviewTab
              service={service}
              companyCurrency={companyCurrency}
              formatCurrency={formatCurrency}
              formatDuration={formatDuration}
              companyProducts={companyProducts}
              showProductsPricingBreakdown={showOverviewProductTotals}
              bookAppointmentTrigger={
                canBookFromServicePage ? (
                  <AppointmentWizard
                    currentUser={user}
                    companyIdOverride={service.companyId}
                    selectedServiceId={service.id}
                    selectedUserId={user?.id ? String(user.id) : undefined}
                    trigger={
                      <Button variant="accent" className="h-10">
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                    }
                  />
                ) : undefined
              }
            />
          </div>
        )}

        {activeTab === "statistics" && (
          <div className="mt-6">
            <ServiceDetailTabToolbar
              title="Statistics"
              showMenu={canManageService}
              onEditSection={() => openEditWizard(0)}
            />
            <ServiceStatisticsTab
              service={service}
              formatCurrency={formatCurrency}
              canViewPricingDetails={canManageService}
            />
          </div>
        )}

        {activeTab === "basic" && (
          <div className="mt-6">
            <ServiceDetailTabToolbar
              title="Basic information"
              showMenu={canManageService}
              onEditSection={() => openEditWizard(0)}
            />
            <ServiceBasicTab service={service} formatCurrency={formatCurrency} formatDuration={formatDuration} />
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="mt-6">
            <ServiceDetailTabToolbar
              title="Gallery"
              showMenu={canManageService}
              onEditSection={() => openEditWizard(1)}
            />
            <ServiceGalleryTab
              service={service}
              companyId={companyId}
              canEditGallery={canManageService}
              onServiceUpdate={(updatedService) => setService(updatedService)}
            />
          </div>
        )}

        {activeTab === "products" && (
          <div className="mt-6">
            <ServiceDetailTabToolbar
              title="Products & pricing"
              showMenu={canManageService}
              onEditSection={() => openEditWizard(2)}
            />
            <ServiceProductsPricingTab service={service} companyProducts={companyProducts} formatCurrency={formatCurrency} />
          </div>
        )}
      </div>

      {companyId && service && (
        <ServiceWizardDialog
          catalog="company"
          open={editWizardOpen}
          onOpenChange={setEditWizardOpen}
          title="Edit Service"
          companyId={String(service.companyId)}
          availableProducts={companyProducts}
          initialService={service}
          selectedSystemCatalog={null}
          initialStepIndex={editWizardStep}
          onSave={handleWizardSave}
        />
      )}

      <CustomDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Service"
        description={`Are you sure you want to delete "${service.name}"? This action cannot be undone.`}
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
            <Button variant="destructive" size="default" className="h-10" onClick={handleDeleteService} disabled={deleting}>
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
