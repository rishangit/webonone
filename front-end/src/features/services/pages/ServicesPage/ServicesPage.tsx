import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchServicesRequest,
  createServiceRequest,
  updateServiceRequest,
  deleteServiceRequest,
  clearError,
  createSystemServiceRequest,
} from "@/features/services/store";
import type { Service as ServiceType, CreateServiceData } from "@/features/services/services";
import type { CreateSystemServiceData, SystemService } from "@/features/services/services/systemServices";
import { currenciesService, Currency } from "@/shared/services/currencies";
import { companyProductsService, type CompanyProduct } from "@/shared/services/products-company-public";
import { UserRole, isRole } from "@/shared/types/user";
import { ServicesPageHeader } from "./components/ServicesPageHeader";
import { ServicesPageSearchToolbar } from "./components/ServicesPageSearchToolbar";
import { ServicesPageLoadingSkeleton } from "./components/ServicesPageLoadingSkeleton";
import { ServicesPageServiceList } from "./components/ServicesPageServiceList";
import { ServicesPageFiltersPanel } from "./components/ServicesPageFiltersPanel";
import { ServicesPageDialogs } from "./components/ServicesPageDialogs";
import { formatDuration, formatPrice as formatPriceUtil, getImageUrl, getStatusColor } from "./utils";
import { buildDomId } from "@/shared/utils/domId";

const ID = {
  root: buildDomId("services", "page"),
  header: buildDomId("services", "page-header"),
  headerActions: buildDomId("services", "page-header-actions"),
  body: buildDomId("services", "page-body"),
  bodyInner: buildDomId("services", "page-body-inner"),
  skeleton: buildDomId("services", "page-skeleton"),
  list: buildDomId("services", "page-list"),
  pagination: buildDomId("services", "page-pagination"),
  emptyState: buildDomId("services", "page-empty-state"),
} as const;

export function ServicesPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { services: reduxServices, loading, error, pagination } = useAppSelector((state) => state.services);
  const { user } = useAppSelector((state) => state.auth);
  const { companies, currentCompany } = useAppSelector((state) => state.companies);
  const isSuperAdmin = isRole(user?.role, UserRole.SYSTEM_ADMIN);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [companyProducts, setCompanyProducts] = useState<CompanyProduct[]>([]);
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isCompanyWizardOpen, setIsCompanyWizardOpen] = useState(false);
  const [isSystemCatalogWizardOpen, setIsSystemCatalogWizardOpen] = useState(false);
  const [systemPickerOpen, setSystemPickerOpen] = useState(false);
  const [nestedSystemWizardOpen, setNestedSystemWizardOpen] = useState(false);
  const [catalogRefreshKey, setCatalogRefreshKey] = useState(0);
  const [selectedCatalogForWizard, setSelectedCatalogForWizard] = useState<SystemService | null>(null);
  const [companyWizardInitialStep, setCompanyWizardInitialStep] = useState(0);
  const [wizardService, setWizardService] = useState<ServiceType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const rawCompanyId = user?.companyId;
  const companyId = rawCompanyId && rawCompanyId !== "undefined" && rawCompanyId !== "null" ? rawCompanyId : undefined;
  const companyScopeId = companyId ?? wizardService?.companyId;

  const refetchServicesList = useCallback(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    dispatch(
      fetchServicesRequest({
        companyId: isSuperAdmin ? undefined : companyId,
        filters: {
          limit: itemsPerPage,
          offset,
          page: currentPage,
          search: debouncedSearchTerm,
          status: filterStatus !== "all" ? filterStatus : undefined,
          categoryId: filterCategory !== "all" ? filterCategory : undefined,
        },
      })
    );
  }, [
    dispatch,
    isSuperAdmin,
    companyId,
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    filterStatus,
    filterCategory,
  ]);

  useEffect(() => {
    const handleHeaderSearch = (event: CustomEvent) => {
      const { query, entity } = event.detail;
      if (entity === "service") {
        setSearchTerm(query);
        setDebouncedSearchTerm(query);
        setCurrentPage(1);
        sessionStorage.removeItem(`searchQuery_service`);
      }
    };

    const storedQuery = sessionStorage.getItem("searchQuery_service");
    if (storedQuery) {
      setSearchTerm(storedQuery);
      setDebouncedSearchTerm(storedQuery);
      setCurrentPage(1);
      sessionStorage.removeItem("searchQuery_service");
    }

    window.addEventListener("headerSearch", handleHeaderSearch as EventListener);
    return () => {
      window.removeEventListener("headerSearch", handleHeaderSearch as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!companyId && !isSuperAdmin) return;
    const offset = (currentPage - 1) * itemsPerPage;
    dispatch(
      fetchServicesRequest({
        companyId: isSuperAdmin ? undefined : companyId,
        filters: {
          limit: itemsPerPage,
          offset,
          page: currentPage,
          search: debouncedSearchTerm,
          status: filterStatus !== "all" ? filterStatus : undefined,
          categoryId: filterCategory !== "all" ? filterCategory : undefined,
        },
      })
    );
  }, [dispatch, companyId, isSuperAdmin, currentPage, itemsPerPage, debouncedSearchTerm, filterStatus, filterCategory]);

  useEffect(() => {
    const loadCompanyProducts = async () => {
      if (!companyScopeId) return;
      try {
        const result = await companyProductsService.getCompanyProducts({ companyId: companyScopeId, limit: 500, offset: 0 });
        const products = Array.isArray(result) ? result : result.products;
        setCompanyProducts(products);
      } catch {
        /* wizard can open without products */
      }
    };
    loadCompanyProducts();
  }, [companyScopeId]);

  useEffect(() => {
    const fetchCompanyCurrency = async () => {
      const currencyCompanyId = companyId ?? wizardService?.companyId;

      if (!currencyCompanyId) {
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
        let company = companies.find((c) => String(c.id) === String(currencyCompanyId)) || currentCompany;

        if (!company || String(company.id) !== String(currencyCompanyId)) {
          try {
            const { companiesService } = await import("@/shared/services/companies-public");
            company = await companiesService.getCompanyById(String(currencyCompanyId));
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
  }, [companyId, wizardService?.companyId, companies, currentCompany]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const services = useMemo(
    () =>
      reduxServices.map((service) => ({
        ...service,
        image: service.image || "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop",
      })),
    [reduxServices]
  );

  const filteredServices = useMemo(() => services, [services]);

  const openAddCompanyService = () => {
    setWizardService(null);
    setSelectedCatalogForWizard(null);
    setCompanyWizardInitialStep(0);
    setIsSystemCatalogWizardOpen(false);
    if (isSuperAdmin) {
      setIsCompanyWizardOpen(true);
      return;
    }
    setSystemPickerOpen(true);
  };

  const handleSystemPickerSelect = (catalog: SystemService) => {
    setSelectedCatalogForWizard(catalog);
    setSystemPickerOpen(false);
    setIsCompanyWizardOpen(true);
  };

  const handleNestedSystemWizardSave = (payload: CreateSystemServiceData) => {
    dispatch(createSystemServiceRequest(payload));
    setNestedSystemWizardOpen(false);
    setCatalogRefreshKey((k) => k + 1);
  };

  const openAddSystemService = () => {
    setWizardService(null);
    setIsCompanyWizardOpen(false);
    setIsSystemCatalogWizardOpen(true);
  };

  const openEditDialog = (service: ServiceType) => {
    setSelectedService(service);
    setWizardService(service);
    setSelectedCatalogForWizard(null);
    setCompanyWizardInitialStep(0);
    setIsSystemCatalogWizardOpen(false);
    setIsCompanyWizardOpen(true);
  };

  const openViewDialog = (service: ServiceType) => {
    navigate(`/system/services/${service.id}`);
  };

  const openDeleteDialog = (service: ServiceType) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleCompanyWizardSave = (payload: CreateServiceData) => {
    const effectiveCompanyId = companyId ?? wizardService?.companyId;
    if (!effectiveCompanyId) {
      toast.error("Company ID not found. Please refresh and try again.");
      return;
    }
    if (wizardService) {
      dispatch(updateServiceRequest({ id: wizardService.id, data: payload }));
    } else {
      dispatch(createServiceRequest({ companyId: effectiveCompanyId, data: payload }));
    }
    setWizardService(null);
    setIsCompanyWizardOpen(false);
    setTimeout(() => refetchServicesList(), 500);
  };

  const handleSystemCatalogWizardSave = (payload: CreateSystemServiceData) => {
    dispatch(createSystemServiceRequest(payload));
    setIsSystemCatalogWizardOpen(false);
  };

  const handleDelete = () => {
    if (!selectedService) return;
    if (!isSuperAdmin && !companyId) {
      toast.error("Company ID not found. Please refresh and try again.");
      return;
    }
    dispatch(deleteServiceRequest(selectedService.id));
    setIsDeleteDialogOpen(false);
    setSelectedService(null);
    setTimeout(() => refetchServicesList(), 500);
  };

  const handleDuplicate = (service: ServiceType) => {
    const dupCompanyId = companyId ?? service.companyId;
    if (!dupCompanyId) {
      toast.error("Company ID not found. Please refresh and try again.");
      return;
    }

    const tagIdsFromService = Array.isArray(service.tags)
      ? service.tags
          .map((tag) => {
            if (typeof tag === "string" && tag.length === 10) {
              return tag;
            }
            if (typeof tag === "object" && tag && "id" in tag && typeof (tag as { id: string }).id === "string") {
              return (tag as { id: string }).id;
            }
            return "";
          })
          .filter((id): id is string => Boolean(id))
      : [];

    const serviceData = {
      name: `${service.name} (Copy)`,
      description: service.description,
      duration: service.duration,
      price: service.price,
      status: service.status,
      images: service.images && service.images.length > 0 ? service.images : service.image ? [service.image] : [],
      tagIds: tagIdsFromService.length > 0 ? tagIdsFromService : undefined,
    };

    dispatch(createServiceRequest({ companyId: dupCompanyId, data: serviceData }));
    setTimeout(() => refetchServicesList(), 500);
  };

  const handleArchive = (service: ServiceType) => {
    const archiveCompanyId = companyId ?? service.companyId;
    if (!archiveCompanyId) {
      toast.error("Company ID not found. Please refresh and try again.");
      return;
    }

    const newStatus = (service.status === "Inactive" ? "Active" : "Inactive") as ServiceType["status"];
    dispatch(updateServiceRequest({ id: service.id, data: { status: newStatus } }));
    setTimeout(() => refetchServicesList(), 500);
  };

  const formatPrice = (price: number) => formatPriceUtil(price, companyCurrency);

  return (
    <div id={ID.root} className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
      <ServicesPageHeader
        id={ID.header}
        headerActionsId={ID.headerActions}
        isSuperAdmin={isSuperAdmin}
        onAddCompanyService={!isSuperAdmin ? openAddCompanyService : undefined}
        onAddSystemService={isSuperAdmin ? openAddSystemService : undefined}
      />

      <ServicesPageSearchToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onDebouncedSearchChange={setDebouncedSearchTerm}
        debouncedSearchTerm={debouncedSearchTerm}
        filterCategory={filterCategory}
        filterStatus={filterStatus}
        onOpenFilters={() => setIsFilterPanelOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div id={ID.body} className="flex flex-col flex-1 min-h-[calc(100vh-300px)]">
        <div id={ID.bodyInner} className="flex flex-col flex-1 min-h-0">
          {loading && reduxServices.length === 0 ? (
            <div id={ID.skeleton}>
              <ServicesPageLoadingSkeleton viewMode={viewMode} />
            </div>
          ) : (
            <ServicesPageServiceList
              listId={ID.list}
              paginationId={ID.pagination}
              emptyStateId={ID.emptyState}
              services={filteredServices}
              viewMode={viewMode}
              isSuperAdmin={isSuperAdmin}
              debouncedSearchTerm={debouncedSearchTerm}
              filterCategory={filterCategory}
              filterStatus={filterStatus}
              pagination={pagination}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(n) => {
                setItemsPerPage(n);
                setCurrentPage(1);
              }}
              onView={openViewDialog}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              formatPrice={formatPrice}
              formatDuration={formatDuration}
              getImageUrl={getImageUrl}
              getStatusColor={getStatusColor}
              onAddService={openAddCompanyService}
              onSuperAdminAddSystemService={isSuperAdmin ? openAddSystemService : undefined}
              onRefreshPage={() => setCurrentPage(1)}
            />
          )}
        </div>
      </div>

      <ServicesPageDialogs
        isDeleteDialogOpen={isDeleteDialogOpen}
        onDeleteDialogOpenChange={setIsDeleteDialogOpen}
        selectedService={selectedService}
        onConfirmDelete={handleDelete}
        companyScopeId={companyScopeId}
        isCompanyWizardOpen={isCompanyWizardOpen}
        onCompanyWizardOpenChange={(open) => {
          setIsCompanyWizardOpen(open);
          if (!open) {
            setWizardService(null);
            setSelectedCatalogForWizard(null);
            setCompanyWizardInitialStep(0);
          }
        }}
        wizardService={wizardService}
        companyProducts={companyProducts}
        selectedSystemCatalog={selectedCatalogForWizard}
        companyWizardInitialStep={companyWizardInitialStep}
        onCompanyWizardSave={handleCompanyWizardSave}
        isSystemCatalogWizardOpen={isSystemCatalogWizardOpen}
        onSystemCatalogWizardOpenChange={setIsSystemCatalogWizardOpen}
        onSystemCatalogWizardSave={handleSystemCatalogWizardSave}
        systemPickerOpen={systemPickerOpen}
        onSystemPickerOpenChange={setSystemPickerOpen}
        onSystemPickerSelect={handleSystemPickerSelect}
        catalogRefreshKey={catalogRefreshKey}
        nestedSystemWizardOpen={nestedSystemWizardOpen}
        onNestedSystemWizardOpenChange={setNestedSystemWizardOpen}
        onNestedSystemWizardSave={handleNestedSystemWizardSave}
      />

      <ServicesPageFiltersPanel
        open={isFilterPanelOpen}
        onOpenChange={setIsFilterPanelOpen}
        services={services}
        filterCategory={filterCategory}
        onFilterCategoryChange={setFilterCategory}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        debouncedSearchTerm={debouncedSearchTerm}
        filteredCount={filteredServices.length}
        onClearFilters={() => {
          setSearchTerm("");
          setDebouncedSearchTerm("");
          setFilterCategory("all");
          setFilterStatus("all");
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
