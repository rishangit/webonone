import { useState, useEffect, useMemo } from "react";
import { Plus, Clock, MoreVertical, Edit, Trash2, Eye, Copy, Archive, Stethoscope } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { SearchInput } from "../../components/common/SearchInput";
import { Pagination } from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import FileUpload from "../../components/ui/file-upload";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { TagSelector } from "../../components/tags/TagSelector";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { useIsMobile } from "../../components/ui/use-mobile";
import { ViewSwitcher } from "../../components/ui/view-switcher";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { 
  fetchServicesRequest, 
  createServiceRequest, 
  updateServiceRequest, 
  deleteServiceRequest,
  clearError 
} from "../../store/slices/servicesSlice";
import { Service as ServiceType } from "../../services/services";
import { formatAvatarUrl } from "../../utils";
import { currenciesService, Currency } from "../../services/currencies";


interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
  subcategory?: string;
  categoryId?: string;
  subcategoryId?: string;
  status: "Active" | "Inactive" | "Draft";
  bookings: {
    thisMonth: number;
    revenue: number;
  };
  tags: string[];
  image: string;
}

// Removed mockServices - now using Redux state from API

export function ServicesPage() {
  const dispatch = useAppDispatch();
  const { services: reduxServices, loading, error, pagination } = useAppSelector((state) => state.services);
  const { user } = useAppSelector((state) => state.auth);
  const { companies, currentCompany } = useAppSelector((state) => state.companies);
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);
  
  // Get company ID from user
  const companyId = user?.companyId;
  
  // Fetch services with pagination and filters
  useEffect(() => {
    if (companyId) {
      const offset = (currentPage - 1) * itemsPerPage;
      dispatch(fetchServicesRequest({ 
        companyId,
        filters: {
          limit: itemsPerPage,
          offset,
          page: currentPage,
          search: debouncedSearchTerm,
          status: filterStatus !== "all" ? filterStatus : undefined,
          categoryId: filterCategory !== "all" ? filterCategory : undefined
        }
      }));
    }
  }, [dispatch, companyId, currentPage, itemsPerPage, debouncedSearchTerm, filterStatus, filterCategory]);

  // Fetch company currency
  useEffect(() => {
    const fetchCompanyCurrency = async () => {
      if (!companyId) {
        // Try to get USD as default if no company ID
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
        // Find company from Redux store first
        let company = companies.find(c => String(c.id) === String(companyId)) || currentCompany;
        
        // If company not found in Redux, fetch it directly via API
        if (!company || String(company.id) !== String(companyId)) {
          try {
            const { companiesService } = await import("../../services/companies");
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
            console.log('ServicesPage: Loaded currency', currency.name, currency.symbol, 'for company', companyId);
          } catch (currencyError) {
            console.error('Error fetching currency by ID:', currencyError);
            // Fallback to USD
            const currencies = await currenciesService.getCurrencies();
            const usdCurrency = currencies.find(c => c.name === 'USD');
            setCompanyCurrency(usdCurrency || null);
          }
        } else {
          // If no currency is set, fetch USD as default
          try {
            const currencies = await currenciesService.getCurrencies();
            const usdCurrency = currencies.find(c => c.name === 'USD');
            setCompanyCurrency(usdCurrency || null);
            console.log('ServicesPage: No currency set for company', companyId, '- using USD');
          } catch (error) {
            console.error('Error fetching default currency:', error);
            setCompanyCurrency(null);
          }
        }
      } catch (error) {
        console.error('Error fetching company currency:', error);
        // Try to get USD as fallback
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
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);
  
  // Transform services to match Service interface
  const services = useMemo(() => {
    return reduxServices.map(service => ({
      ...service,
      image: service.image || "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop"
    }));
  }, [reduxServices]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
    categoryId: "",
    subcategoryId: "",
    category: "",
    subcategory: "",
    status: "Active" as Service["status"],
    tags: [] as string[],
    image: ""
  });
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const isMobile = useIsMobile();


  // For server-side pagination, we use the services directly from Redux
  // Client-side filtering is only for category (if not handled by API)
  const filteredServices = useMemo(() => {
    if (filterCategory === "all") {
      return services;
    }
    // Filter by category on client side if needed
    return services.filter(service => service.category === filterCategory);
  }, [services, filterCategory]);

  // CRUD Operations
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration: "",
      price: "",
      categoryId: "",
      subcategoryId: "",
      category: "",
      subcategory: "",
      status: "Active",
      tags: [],
      image: ""
    });
    setTagIds([]);
    setImagePreview(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (service: ServiceType) => {
    setSelectedService(service);
    
    // Extract tagIds from tags array (tags might be strings or objects)
    const extractedTagIds = Array.isArray(service.tags) 
      ? service.tags.map(tag => {
          if (typeof tag === 'string' && tag.length === 10) {
            return tag;
          } else if (typeof tag === 'object' && tag.id) {
            return tag.id;
          }
          return '';
        }).filter((id): id is string => Boolean(id) && typeof id === 'string' && id.length === 10)
      : [];
    
    setFormData({
      name: service.name,
      description: service.description || "",
      duration: service.duration.toString(),
      price: service.price.toString(),
      categoryId: "",
      subcategoryId: "",
      category: "",
      subcategory: "",
      status: service.status,
      tags: [],
      image: service.image || ""
    });
    setTagIds(extractedTagIds);
    setImagePreview(service.image || null);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (service: ServiceType) => {
    setSelectedService(service);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (service: ServiceType) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleImageUploaded = (filePath: string, _fileUrl: string) => {
    setFormData(prev => ({ ...prev, image: filePath }));
  };

  const handleImageDeleted = () => {
    setFormData(prev => ({ ...prev, image: "" }));
    setImagePreview(null);
  };


  const handleSave = () => {
    if (!formData.name || !formData.duration || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isNaN(parseInt(formData.duration)) || parseInt(formData.duration) <= 0) {
      toast.error("Duration must be a valid positive number");
      return;
    }

    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      toast.error("Price must be a valid positive number");
      return;
    }

    if (!companyId) {
      toast.error("Company ID not found. Please refresh and try again.");
      return;
    }

    // Use tagIds from state

    const serviceData = {
      name: formData.name,
      description: formData.description || undefined,
      duration: parseInt(formData.duration),
      price: parseFloat(formData.price),
      status: formData.status,
      imageUrl: formData.image || undefined,
      tagIds: tagIds.length > 0 ? tagIds : undefined
    };

    if (isEditDialogOpen && selectedService) {
      dispatch(updateServiceRequest({ id: selectedService.id, data: serviceData }));
      setIsEditDialogOpen(false);
    } else {
      dispatch(createServiceRequest({ companyId, data: serviceData }));
      setIsAddDialogOpen(false);
    }

    resetForm();
    
    // Refresh services list after create/update
    if (companyId) {
      setTimeout(() => {
        const offset = (currentPage - 1) * itemsPerPage;
        dispatch(fetchServicesRequest({ 
          companyId,
          filters: {
            limit: itemsPerPage,
            offset,
            page: currentPage,
            search: debouncedSearchTerm,
            status: filterStatus !== "all" ? filterStatus : undefined,
            categoryId: filterCategory !== "all" ? filterCategory : undefined
          }
        }));
      }, 500);
    }
  };

  const handleDelete = () => {
    if (selectedService && companyId) {
      dispatch(deleteServiceRequest(selectedService.id));
      setIsDeleteDialogOpen(false);
      setSelectedService(null);
      // Refresh services list after delete
      setTimeout(() => {
        const offset = (currentPage - 1) * itemsPerPage;
        dispatch(fetchServicesRequest({ 
          companyId,
          filters: {
            limit: itemsPerPage,
            offset,
            page: currentPage,
            search: debouncedSearchTerm,
            status: filterStatus !== "all" ? filterStatus : undefined,
            categoryId: filterCategory !== "all" ? filterCategory : undefined
          }
        }));
      }, 500);
    }
  };

  const handleDuplicate = (service: ServiceType) => {
    if (!companyId) {
      toast.error("Company ID not found. Please refresh and try again.");
      return;
    }
    
    // Extract tagIds from tags
    const tagIds = Array.isArray(service.tags) 
      ? service.tags.map(tag => {
          if (typeof tag === 'string' && tag.length === 10) {
            return tag;
          }
          return '';
        }).filter((id): id is string => Boolean(id))
      : [];
    
    const serviceData = {
      name: `${service.name} (Copy)`,
      description: service.description,
      duration: service.duration,
      price: service.price,
      status: service.status,
      imageUrl: service.image || undefined,
      tagIds: tagIds.length > 0 ? tagIds : undefined
    };
    
    dispatch(createServiceRequest({ companyId, data: serviceData }));
    
    // Refresh services list after duplicate
    setTimeout(() => {
      const offset = (currentPage - 1) * itemsPerPage;
      dispatch(fetchServicesRequest({ 
        companyId,
        filters: {
          limit: itemsPerPage,
          offset,
          page: currentPage,
          search: debouncedSearchTerm,
          status: filterStatus !== "all" ? filterStatus : undefined,
          categoryId: filterCategory !== "all" ? filterCategory : undefined
        }
      }));
    }, 500);
  };

  const handleArchive = (service: ServiceType) => {
    if (!companyId) {
      toast.error("Company ID not found. Please refresh and try again.");
      return;
    }
    
    const newStatus = service.status === "Inactive" ? "Active" : "Inactive" as ServiceType["status"];
    dispatch(updateServiceRequest({ id: service.id, data: { status: newStatus } }));
    
    // Refresh services list after archive
    setTimeout(() => {
      const offset = (currentPage - 1) * itemsPerPage;
      dispatch(fetchServicesRequest({ 
        companyId,
        filters: {
          limit: itemsPerPage,
          offset,
          page: currentPage,
          search: debouncedSearchTerm,
          status: filterStatus !== "all" ? filterStatus : undefined,
          categoryId: filterCategory !== "all" ? filterCategory : undefined
        }
      }));
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case "Inactive": return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
      case "Draft": return "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const formatPrice = (price: number) => {
    const numPrice = Number(price) || 0;
    
    // Always use company currency (or USD default if no currency is set)
    if (companyCurrency) {
      const decimals = companyCurrency.decimals || 2;
      
      if (isNaN(numPrice)) {
        return `${companyCurrency.symbol} ${(0).toFixed(decimals)}`;
      }
      
      // Round the price according to currency rounding
      const roundedPrice = Math.round(numPrice / companyCurrency.rounding) * companyCurrency.rounding;
      
      // Format with currency symbol directly with space
      const formattedNumber = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(roundedPrice);
      
      return `${companyCurrency.symbol} ${formattedNumber}`;
    }
    
    // Last resort fallback (should rarely happen)
    if (isNaN(numPrice)) {
      return '$ 0.00';
    }
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(numPrice);
    // Replace $ with $  to add space
    return formatted.replace('$', '$ ');
  };

  const getImageUrl = (service: ServiceType) => {
    if (service.image) {
      // Check if it's a URL path that needs formatting
      if (service.image.startsWith('companies/') || service.image.startsWith('/uploads/')) {
        return formatAvatarUrl(service.image);
      }
      return service.image;
    }
    return "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop";
  };

  // Helper function to render tags with colors
  const renderTags = (tags: any[]) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mb-4">
        {tags.slice(0, 3).map((tag, index) => {
          // Handle both string tags (legacy) and Tag objects
          const tagObj = typeof tag === 'string' 
            ? { id: index.toString(), name: tag, color: '#3B82F6', icon: undefined }
            : tag;
          return (
            <Badge
              key={tagObj.id || index}
              variant="secondary"
              className="text-xs"
              style={{ 
                backgroundColor: `${tagObj.color}20`, 
                color: tagObj.color,
                borderColor: `${tagObj.color}40`
              }}
            >
              {tagObj.icon && <span className="mr-1">{tagObj.icon}</span>}
              {tagObj.name}
            </Badge>
          );
        })}
        {tags.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{tags.length - 3}
          </Badge>
        )}
      </div>
    );
  };

  const ServiceCard = ({ service }: { service: ServiceType }) => (
    <Card className="overflow-hidden backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={getImageUrl(service)} 
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-3 left-3">
          <Badge className={`${getStatusColor(service.status)} backdrop-blur-sm border`}>
            {service.status}
          </Badge>
        </div>
        <div className="absolute bottom-3 right-3">
          <Badge className="bg-black/70 text-white backdrop-blur-sm border border-white/20 px-3 py-1.5 font-semibold">
            {formatPrice(service.price)}
          </Badge>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-1">{service.name}</h3>
            {service.category && (
              <p className="text-[var(--accent-text)] text-sm">{service.category}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent flex-shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border" align="end">
              <DropdownMenuItem onClick={() => openViewDialog(service)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEditDialog(service)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Service
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(service)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleArchive(service)}>
                <Archive className="w-4 h-4 mr-2" />
                {service.status === "Inactive" ? "Restore" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => openDeleteDialog(service)}
                className="text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {service.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
        )}

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[var(--accent-text)]" />
            <span className="text-foreground font-medium">{formatDuration(service.duration)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Price:</span>
            <span className="text-[var(--accent-text)] font-semibold">{formatPrice(service.price)}</span>
          </div>
        </div>

        {renderTags(service.tags || [])}
      </div>
    </Card>
  );

  const ServiceListItem = ({ service }: { service: ServiceType }) => (
    <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
      <div className="flex items-start gap-6">
        {/* Service Image */}
        <div className="flex-shrink-0 relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 w-20 h-16 flex items-center justify-center">
          <img 
            src={getImageUrl(service)} 
            alt={service.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-1 right-1">
            <Badge className={`${getStatusColor(service.status)} text-xs border`}>
              {service.status}
            </Badge>
          </div>
        </div>
        
        {/* Service Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground mb-1">{service.name}</h3>
              {service.category && (
                <p className="text-[var(--accent-text)] text-sm mb-2">{service.category}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] px-3 py-1 font-semibold">
                {formatPrice(service.price)}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border" align="end">
                  <DropdownMenuItem onClick={() => openViewDialog(service)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openEditDialog(service)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Service
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicate(service)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleArchive(service)}>
                    <Archive className="w-4 h-4 mr-2" />
                    {service.status === "Inactive" ? "Restore" : "Archive"}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => openDeleteDialog(service)}
                    className="text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-[var(--accent-text)]" />
              <span>Duration: <span className="text-foreground font-medium">{formatDuration(service.duration)}</span></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Bookings: <span className="text-foreground font-medium">{service.bookings.thisMonth}</span></span>
            </div>
          </div>
          
          {service.description && (
            <p className="text-sm text-foreground mb-3 line-clamp-1">{service.description}</p>
          )}
          
          {renderTags(service.tags || [])}
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="text-sm">
              <span className="text-muted-foreground">Revenue: </span>
              <span className="text-[var(--accent-text)] font-semibold">{formatPrice(service.bookings.revenue)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Services</h1>
          <p className="text-muted-foreground mt-1">Manage your service offerings and appointments</p>
        </div>
        <Button onClick={openAddDialog} variant="accent">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        <div className="space-y-4">
          <SearchInput
            placeholder="Search services by name, category, or description..."
            value={searchTerm}
            onChange={setSearchTerm}
            onDebouncedChange={setDebouncedSearchTerm}
            debounceDelay={500}
          />

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="sm:w-48 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Categories</SelectItem>
                  {[...new Set(services.map(s => s.category))].map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || filterCategory !== "all" || filterStatus !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setDebouncedSearchTerm("");
                    setFilterCategory("all");
                    setFilterStatus("all");
                    setCurrentPage(1);
                  }}
                  className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-accent"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* View Mode Toggle */}
            <ViewSwitcher 
              viewMode={viewMode} 
              onViewModeChange={setViewMode} 
            />
          </div>
        </div>
      </Card>

      {/* Services Grid/List */}
      {loading && reduxServices.length === 0 ? (
        <>
          {viewMode === "list" ? (
            /* Skeleton for List View - Matching ServiceListItem structure */
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-20 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 mr-2">
                          <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        </div>
                      </div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Skeleton for Grid View - Matching ServiceCard structure */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700 animate-pulse">
                    <div className="absolute top-3 left-3">
                      <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                    </div>
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1.5">
                        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : filteredServices.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <ServiceListItem key={service.id} service={service} />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          icon={Stethoscope}
          title="No services found"
          description={
            debouncedSearchTerm || filterCategory !== "all" || filterStatus !== "all"
              ? "Try adjusting your filters to see more services"
              : "You haven't created any services yet"
            }
          action={{
            label: "Add Your First Service",
            onClick: openAddDialog,
            variant: "accent",
            icon: Plus,
          }}
        />
      )}

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
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
      )}

      {/* Add Service Dialog */}
      <CustomDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add New Service"
        description="Create a new service for your company"
        maxWidth="max-w-4xl"
        className="h-[90vh]"
      >
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-3">
            <Label className="text-foreground">Service Image</Label>
            <FileUpload
              onFileUploaded={handleImageUploaded}
              onFileDeleted={handleImageDeleted}
              currentImagePath={formData.image}
              currentImageUrl={formData.image ? (formData.image.startsWith('companies/') || formData.image.startsWith('/uploads/') ? formatAvatarUrl(formData.image) : formData.image) : undefined}
              folderPath={companyId ? `companies/${companyId}/services` : 'companies/services'}
              label="Upload Service Image"
              maxSize={10}
              className="w-full"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="name" className="text-foreground">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter service name"
              className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter service description"
              className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="duration" className="text-foreground">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="60"
                className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="price" className="text-foreground">Price *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="status" className="text-foreground">Status</Label>
            <Select value={formData.status} onValueChange={(value: Service["status"]) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-foreground">Tags</Label>
            <TagSelector
              value={tagIds}
              onChange={(ids) => setTagIds(ids)}
              placeholder="Select tags for this service"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
              className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              variant="accent"
            >
              Add Service
            </Button>
          </div>
        </div>
      </CustomDialog>

      {/* Edit Service Dialog */}
      <CustomDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Service"
        description="Update service information and settings"
        maxWidth="max-w-4xl"
        className="h-[90vh]"
      >
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-3">
            <Label className="text-foreground">Service Image</Label>
            <FileUpload
              onFileUploaded={handleImageUploaded}
              onFileDeleted={handleImageDeleted}
              currentImagePath={formData.image}
              currentImageUrl={formData.image ? (formData.image.startsWith('companies/') || formData.image.startsWith('/uploads/') ? formatAvatarUrl(formData.image) : formData.image) : undefined}
              folderPath={companyId ? `companies/${companyId}/services` : 'companies/services'}
              label="Upload Service Image"
              maxSize={10}
              className="w-full"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="edit-name" className="text-foreground">Service Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter service name"
              className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="edit-description" className="text-foreground">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter service description"
              className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="edit-duration" className="text-foreground">Duration (minutes) *</Label>
              <Input
                id="edit-duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="edit-price" className="text-foreground">Price *</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-foreground">Tags</Label>
            <TagSelector
              value={tagIds}
              onChange={(ids) => setTagIds(ids)}
              placeholder="Select tags for this service"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              variant="accent"
            >
              Update Service
            </Button>
          </div>
        </div>
      </CustomDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Service</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{selectedService?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[var(--glass-border)] text-foreground hover:bg-accent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete Service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}