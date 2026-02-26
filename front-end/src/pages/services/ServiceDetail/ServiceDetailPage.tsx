import { useState, useEffect } from "react";
import { Stethoscope } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
import { servicesService, Service } from "../../../services/services";
import { currenciesService } from "../../../services/currencies";
import type { Currency } from "../../../services/currencies";
import { toast } from "sonner";
import { isRole, UserRole } from "../../../types/user";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { useNavigate } from "react-router-dom";
import { fetchServiceRequest } from "../../../store/slices/servicesSlice";
import { CustomDialog } from "../../../components/ui/custom-dialog";
import { ServiceDetailHeader } from "./ServiceDetailHeader";
import { ServiceOverviewTab } from "./overview/ServiceOverviewTab";
import { ServiceGalleryTab } from "./gallery/ServiceGalleryTab";
import { ServiceStatisticsTab } from "./statistics/ServiceStatisticsTab";

interface ServiceDetailPageProps {
  serviceId: string;
  onBack: () => void;
}

export const ServiceDetailPage = ({ serviceId, onBack }: ServiceDetailPageProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { companies, currentCompany } = useAppSelector((state) => state.companies);
  const { currentService, loading } = useAppSelector((state) => state.services);
  const isCompanyOwner = isRole(user?.role, UserRole.COMPANY_OWNER);

  const [service, setService] = useState<Service | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLocalLoading(true);
        dispatch(fetchServiceRequest(serviceId));
        const serviceData = await servicesService.getServiceById(serviceId);
        setService(serviceData);
      } catch (error: any) {
        console.error('Error fetching service:', error);
        toast.error(error.message || 'Failed to load service details');
      } finally {
        setLocalLoading(false);
      }
    };

    fetchService();
  }, [serviceId, dispatch]);

  // Use Redux currentService if available and matches
  useEffect(() => {
    if (currentService && currentService.id === serviceId) {
      setService(currentService);
    }
  }, [currentService, serviceId]);

  // Fetch company currency
  useEffect(() => {
    const fetchCompanyCurrency = async () => {
      const companyId = user?.companyId || service?.companyId;
      
      if (!companyId) {
        try {
          const currencies = await currenciesService.getCurrencies();
          const usdCurrency = currencies.find(c => c.name === 'USD');
          setCompanyCurrency(usdCurrency || null);
        } catch (error) {
          console.error('Error fetching default currency:', error);
          setCompanyCurrency(null);
        }
        return;
      }
      
      try {
        let company = companies.find(c => String(c.id) === String(companyId)) || currentCompany;
        
        if (!company || String(company.id) !== String(companyId)) {
          try {
            const { companiesService } = await import("../../../services/companies");
            company = await companiesService.getCompanyById(String(companyId));
          } catch (fetchError) {
            console.error('Error fetching company:', fetchError);
          }
        }
        
        const currencyId = company?.currencyId;
        
        if (currencyId) {
          try {
            const currency = await currenciesService.getCurrency(currencyId);
            setCompanyCurrency(currency);
          } catch (currencyError) {
            console.error('Error fetching currency by ID:', currencyError);
            const currencies = await currenciesService.getCurrencies();
            const usdCurrency = currencies.find(c => c.name === 'USD');
            setCompanyCurrency(usdCurrency || null);
          }
        } else {
          try {
            const currencies = await currenciesService.getCurrencies();
            const usdCurrency = currencies.find(c => c.name === 'USD');
            setCompanyCurrency(usdCurrency || null);
          } catch (error) {
            console.error('Error fetching default currency:', error);
            setCompanyCurrency(null);
          }
        }
      } catch (error) {
        console.error('Error fetching company currency:', error);
        try {
          const currencies = await currenciesService.getCurrencies();
          const usdCurrency = currencies.find(c => c.name === 'USD');
          setCompanyCurrency(usdCurrency || null);
        } catch (fallbackError) {
          setCompanyCurrency(null);
        }
      }
    };
    
    fetchCompanyCurrency();
  }, [user?.companyId, service?.companyId, companies, currentCompany]);

  const formatCurrency = (amount: number) => {
    const numPrice = Number(amount) || 0;
    
    if (isNaN(numPrice)) {
      return companyCurrency ? `${companyCurrency.symbol} ${(0).toFixed(companyCurrency.decimals || 2)}` : '$ 0.00';
    }
    
    if (companyCurrency) {
      const decimals = companyCurrency.decimals || 2;
      const roundedPrice = Math.round(numPrice / companyCurrency.rounding) * companyCurrency.rounding;
      const formattedNumber = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(roundedPrice);
      return `${companyCurrency.symbol} ${formattedNumber}`;
    }
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(numPrice);
    return formatted.replace('$', '$ ');
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hr${hours > 1 ? 's' : ''}`;
    }
    return `${hours} hr${hours > 1 ? 's' : ''} ${mins} min`;
  };

  const handleDeleteService = async () => {
    if (!service) return;
    
    try {
      setDeleting(true);
      await servicesService.deleteService(service.id);
      toast.success("Service deleted successfully");
      onBack();
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast.error(error.message || "Failed to delete service");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEditService = () => {
    onBack();
    // Note: Editing is done via dialog in the services list page
    toast.info("Navigate to the service in the list to edit");
  };

  if (localLoading || loading) {
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
          <p className="text-muted-foreground mb-4">The service you're looking for doesn't exist.</p>
          <Button onClick={onBack} variant="outline">
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  const companyId = user?.companyId || service?.companyId;

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 w-full">
      <ServiceDetailHeader
        service={service}
        isCompanyOwner={isCompanyOwner}
        onBack={onBack}
        onEdit={handleEditService}
        onDelete={() => setShowDeleteDialog(true)}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ServiceOverviewTab
            service={service}
            companyCurrency={companyCurrency}
            formatCurrency={formatCurrency}
            formatDuration={formatDuration}
          />
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <ServiceGalleryTab
            service={service}
            companyId={companyId}
            onServiceUpdate={(updatedService) => setService(updatedService)}
          />
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <ServiceStatisticsTab
            service={service}
            companyCurrency={companyCurrency}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <CustomDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Service"
        description={`Are you sure you want to delete "${service.name}"? This action cannot be undone.`}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteService}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        }
      >
        <div></div>
      </CustomDialog>
    </div>
  );
};
