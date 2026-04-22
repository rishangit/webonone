import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { ViewSwitcher } from "@/components/ui/view-switcher";
import { Stethoscope } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchServicesRequest } from "@/store/slices/servicesSlice";
import { Service as ServiceType } from "@/services/services";
import { ServiceCard } from "@/pages/services/ServicesPage/components";
import { formatDuration, formatPrice as formatPriceUtil, getImageUrl, getStatusColor } from "@/pages/services/ServicesPage/utils";
import { currenciesService, Currency } from "@/services/currencies";

interface CompanyServicesTabProps {
  companyId: string;
}

export const CompanyServicesTab = ({ companyId }: CompanyServicesTabProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { services: reduxServices, loading, pagination } = useAppSelector((state) => state.services);
  const { companies, currentCompany } = useAppSelector((state) => state.companies);
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);

  // Fetch services for the company
  useEffect(() => {
    if (companyId) {
      const offset = (currentPage - 1) * itemsPerPage;
      dispatch(fetchServicesRequest({
        companyId,
        filters: {
          page: currentPage,
          limit: itemsPerPage,
          offset,
        }
      }));
    }
  }, [dispatch, companyId, currentPage, itemsPerPage]);

  // Fetch company currency
  useEffect(() => {
    const fetchCompanyCurrency = async () => {
      if (!companyId) return;
      
      try {
        let company = companies.find(c => String(c.id) === String(companyId)) || currentCompany;
        
        if (!company || String(company.id) !== String(companyId)) {
          try {
            const { companiesService } = await import("@/services/companies");
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
          const currencies = await currenciesService.getCurrencies();
          const usdCurrency = currencies.find(c => c.name === 'USD');
          setCompanyCurrency(usdCurrency || null);
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
  }, [companyId, companies, currentCompany]);

  const formatPrice = (amount: number) => {
    if (!companyCurrency) {
      return formatPriceUtil(amount, null);
    }
    return formatPriceUtil(amount, companyCurrency);
  };

  // Filter services for this company
  const companyServices = useMemo(() => {
    return reduxServices.filter(service => String(service.companyId) === String(companyId));
  }, [reduxServices, companyId]);

  const handleViewService = (service: ServiceType) => {
    navigate(`/system/companies/${companyId}/services/${service.id}`);
  };

  const handleEditService = (service: ServiceType) => {
    // Navigate to services page with edit mode
    navigate(`/system/companies/${companyId}/services/${service.id}`);
  };

  const handleDeleteService = (service: ServiceType) => {
    // Handle delete - could show a dialog
    console.log('Delete service:', service.id);
  };

  const handleDuplicateService = (service: ServiceType) => {
    // Handle duplicate
    console.log('Duplicate service:', service.id);
  };

  const handleArchiveService = (service: ServiceType) => {
    // Handle archive
    console.log('Archive service:', service.id);
  };

  if (loading && companyServices.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)] mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Switcher */}
      <div className="flex items-center justify-end">
        <ViewSwitcher
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Services List */}
      {companyServices.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {companyServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onView={handleViewService}
                  onEdit={handleEditService}
                  onDelete={handleDeleteService}
                  onDuplicate={handleDuplicateService}
                  onArchive={handleArchiveService}
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
              {companyServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onView={handleViewService}
                  onEdit={handleEditService}
                  onDelete={handleDeleteService}
                  onDuplicate={handleDuplicateService}
                  onArchive={handleArchiveService}
                  formatPrice={formatPrice}
                  formatDuration={formatDuration}
                  getImageUrl={getImageUrl}
                  getStatusColor={getStatusColor}
                  viewMode="list"
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && (
            <div className="mt-6">
              <Pagination
                totalItems={pagination.total}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                showItemsPerPageSelector={true}
                itemsPerPageOptions={[12, 24, 48, 96]}
                onItemsPerPageChange={(newItemsPerPage) => {
                  setItemsPerPage(newItemsPerPage);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Stethoscope}
          title="No services found"
          description="This company hasn't added any services yet."
        />
      )}
    </div>
  );
};
