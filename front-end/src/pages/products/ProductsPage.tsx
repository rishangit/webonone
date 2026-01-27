import { useState, useEffect, useMemo } from "react";
import { Plus, Package, DollarSign, MoreVertical, Edit, Trash2, Eye, Settings, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ShoppingCart, Store, Star, PackageCheck, Tag } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { SearchInput } from "../../components/common/SearchInput";
import { Pagination } from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useIsMobile } from "../../components/ui/use-mobile";
import { ViewSwitcher } from "../../components/ui/view-switcher";
import { AddProductToCompanyDialog } from "./AddProductToCompanyDialog";
import { CompanyProductCard } from "./CompanyProductCard";
import { toast } from "sonner";
import { database } from "../../services";
import { isRole, UserRole } from "../../types/user";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCompanyProductsRequest, deleteCompanyProductRequest } from "../../store/slices/companyProductsSlice";
import { CompanyProduct } from "../../services/companyProducts";
import { DeleteConfirmationDialog } from "../../components/common/DeleteConfirmationDialog";
import { currenciesService, Currency } from "../../services/currencies";

interface ProductVariant {
  id: string;
  name: string;
  description: string;
  sku: string;
  isActive: boolean;
  color?: string;
  size?: string;
  weight?: string;
  dimensions?: string;
  material?: string;
  notes?: string;
}

interface Tag {
  id: number;
  name: string;
  color: string;
  icon?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  type: "sell" | "service" | "both";
  price: {
    cost: number;
    sell?: number;
  };
  stock: {
    current: number;
    minimum: number;
    unit: string;
  };
  supplier: {
    name: string;
    contact: string;
    avatar: string;
  };
  status: "Active" | "Low Stock" | "Out of Stock" | "Discontinued";
  popularity: "High" | "Medium" | "Low";
  usage: {
    thisMonth: number;
    trend: "up" | "down" | "stable";
  };
  addedBy: "system" | "company";
  companyId?: string; // Which company owns this product (for company-specific products)
  image: string;
  tags: string[] | Tag[]; // Support both string array (legacy) and Tag objects
  lastRestocked: string;
  isAvailableForPurchase?: boolean; // For users - can they buy this product
  usedInServices?: string[]; // List of service IDs where this product is used
  variants?: ProductVariant[];
}

interface ProductsPageProps {
  currentUser?: {
    email: string;
    role: string;
    name: string;
    companyId?: string; // User's company association
  } | null;
  onNavigate?: (page: string) => void;
  onViewProduct?: (productId: string) => void;
}

export function ProductsPage({ currentUser, onNavigate, onViewProduct }: ProductsPageProps) {
  const dispatch = useAppDispatch();
  const { companyProducts, loading: companyProductsLoading, pagination } = useAppSelector((state) => state.companyProducts);
  const { user } = useAppSelector((state) => state.auth);
  const { companies, currentCompany, userCompany } = useAppSelector((state) => state.companies);
  
  // All state declarations at the top (like ServicesPage)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");  
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);
  const [productToDelete, setProductToDelete] = useState<CompanyProduct | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isCompanyOwner = isRole(currentUser?.role, UserRole.COMPANY_OWNER);

  // Get companyId from user (like ServicesPage)
  const companyId = user?.companyId || currentUser?.companyId;

  // Redirect Super Admins to System Products page (early return)
  if (currentUser?.role === "Super Admin") {
    return (
      <div className="flex-1 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)] rounded-xl p-8">
            <Package className="w-16 h-16 mx-auto mb-4 text-[var(--accent-text)]" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">Access System Products</h2>
            <p className="text-muted-foreground mb-6">
              As a Super Admin, you should manage products through the System Products page where you can create and manage the master product catalog.
            </p>
            <Button 
              onClick={() => onNavigate?.("system-products")}
              variant="accent"
            >
              <PackageCheck className="w-4 h-4 mr-2" />
              Go to System Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fetch company products with pagination and filters (like ServicesPage)
  useEffect(() => {
    if (isCompanyOwner && companyId) {
        const offset = (currentPage - 1) * itemsPerPage;
        dispatch(fetchCompanyProductsRequest({ 
          companyId,
          filters: {
            limit: itemsPerPage,
            offset,
            page: currentPage,
            search: debouncedSearchTerm
          }
        }));
    } else if (!isCompanyOwner && currentUser?.role !== "Super Admin" && companyId) {
      // For other roles, use the old database method
      const loadProducts = async () => {
        try {
          const companyProducts = await database.products.getCompanyProducts(companyId);
          setProducts(companyProducts);
        } catch (error) {
          console.error('Error loading products:', error);
        }
      };
      loadProducts();
    }
  }, [dispatch, isCompanyOwner, companyId, currentPage, itemsPerPage, debouncedSearchTerm, currentUser?.role]);

  // Fetch company currency (like ServicesPage)
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

  // Helper to check if user can add products (Company Owner or Staff)
  const canAddProducts = () => {
    if (!currentUser?.role) return false;
    
    const roleStr = String(currentUser.role).toLowerCase();
    const roleNum = typeof currentUser.role === 'number' ? currentUser.role : null;
    
    // Check for Company Owner (role 1 or "Company Owner")
    const isCompanyOwner = isRole(currentUser.role, UserRole.COMPANY_OWNER) || 
                          currentUser.role === "Company Owner" || 
                          roleNum === 1 ||
                          roleStr === "company owner" ||
                          roleStr === "1";
    
    // Check for Staff Member (role 2 or "Staff Member" or "Staff")
    const isStaff = isRole(currentUser.role, UserRole.STAFF_MEMBER) ||
                   currentUser.role === "Staff Member" ||
                   currentUser.role === "Staff" ||
                   roleNum === 2 ||
                   roleStr === "staff member" ||
                   roleStr === "staff" ||
                   roleStr === "2";
    
    return isCompanyOwner || isStaff;
  };

  // Add a new product to company inventory
  // For Company Owners, product is already added via Redux (toast is shown in epic)
  const handleAddProduct = (newProduct: any) => {
    // For company owners, the product is already added via Redux
    // The toast is already shown in the createCompanyProductEpic
    // Just close the dialog and refresh if needed
    if (isCompanyOwner) {
      setIsAddProductDialogOpen(false);
      // Refresh company products to get the latest data
      if (currentUser?.companyId) {
        const offset = (currentPage - 1) * itemsPerPage;
        dispatch(fetchCompanyProductsRequest({ 
          companyId: currentUser.companyId,
          filters: {
            limit: itemsPerPage,
            offset,
            page: currentPage,
            search: debouncedSearchTerm
          }
        }));
      }
      return;
    }
    
    // For non-company owners, use the old method
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      description: newProduct.description || "No description provided",
      sku: newProduct.sku,
      category: newProduct.category,
      type: "both",
      price: newProduct.price,
      stock: newProduct.stock,
      supplier: newProduct.systemProductId ? 
        products.find(p => p.id === newProduct.systemProductId)?.supplier || {
          name: "Direct Supply",
          contact: "supply@company.com",
          avatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"
        } : {
          name: newProduct.supplier?.name || "Direct Supply",
          contact: newProduct.supplier?.contact || "supply@company.com",
          avatar: newProduct.supplier?.avatar || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"
        },
      status: "Active",
      popularity: "Medium",
      usage: { thisMonth: 0, trend: "stable" },
      addedBy: "company",
      companyId: currentUser?.companyId,
      image: newProduct.image || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop",
      tags: newProduct.tags || [],
      lastRestocked: new Date().toISOString().split('T')[0],
      isAvailableForPurchase: true,
      variants: newProduct.variants || []
    };

    setProducts(prev => [...prev, product]);
    toast.success("Product added to your inventory!");
  };

  // Get existing product SKUs for the dialog
  const getExistingProductSKUs = () => {
    if (isCompanyOwner) {
      // For company owners, get SKUs from company products
      return companyProducts.map((cp: CompanyProduct) => cp.sku || '').filter(Boolean);
    }
    return products
      .filter(p => p.addedBy === "company" && p.companyId === currentUser?.companyId)
      .map(p => p.sku);
  };

  // Role-based product filtering - Memoized to prevent unnecessary re-renders
  // For Company Owners, filter company products; for others, filter regular products
  const filteredProducts = useMemo(() => {
    const productsToFilter = isCompanyOwner ? companyProducts : products;
    let filtered = [...productsToFilter];

    // For Company Owners, we only show their company products (already filtered by API with search)
    // Search is handled server-side, so we only apply client-side filters (type, status) if needed
    // For other roles, apply role-based filtering
    if (!isCompanyOwner) {
      if (currentUser?.role === "Super Admin") {
        // Super Admin sees ALL products in the system
        filtered = products;
      } else {
        // Regular Users see products they can buy or products used in services they book
        filtered = products.filter(product => 
          product.isAvailableForPurchase === true || 
          (product.usedInServices && product.usedInServices.length > 0)
        );
      }
    }

    // Apply client-side filters (for non-company owners, or additional filters for company owners)
    return filtered.filter(product => {
      // For company owners, search is handled server-side, so we skip client-side search filtering
      // For other roles, apply client-side search using debounced term
      if (!isCompanyOwner) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        
        // If no search term, show all products
        if (!searchLower.trim()) {
          // Continue with other filters
        } else {
        // Handle both Product and CompanyProduct types
        const productName = (product as Product).name;
        const productDescription = (product as Product).description;
        const productSku = (product as Product).sku;
        const productTags = (product as Product).tags;
        
        const matchesSearch = (productName?.toLowerCase() || '').includes(searchLower) ||
                             (productDescription?.toLowerCase() || '').includes(searchLower) ||
                             (productSku?.toLowerCase() || '').includes(searchLower) ||
                             (productTags && productTags.some((tag: any) => {
                               if (typeof tag === 'string') {
                                 return tag.toLowerCase().includes(searchLower);
                               } else if (tag && typeof tag === 'object' && tag.name) {
                                 return tag.name.toLowerCase().includes(searchLower);
                               }
                               return false;
                             }));
        
        if (!matchesSearch) return false;
        }
      }
      
      // Apply other filters (category, type, status) - these are client-side for all roles
      const productType = isCompanyOwner ? undefined : (product as Product).type; // Company products don't have type at product level
      const productStatus = isCompanyOwner 
        ? ((product as CompanyProduct).isAvailableForPurchase ? 'Active' : 'Inactive')
        : (product as Product).status;
      
      const matchesCategory = filterCategory === "all"; // Company products don't have categories
      const matchesType = filterType === "all" || productType === filterType;
      const matchesStatus = filterStatus === "all" || productStatus === filterStatus;
      
      return matchesCategory && matchesType && matchesStatus;
    });
  }, [isCompanyOwner, companyProducts, products, currentUser?.role, debouncedSearchTerm, filterCategory, filterType, filterStatus]);

  // Handlers for company product CRUD operations
  const handleEditCompanyProduct = (product: CompanyProduct) => {
    // TODO: Implement edit dialog for company products
    console.log('Edit company product:', product);
    toast.info('Edit functionality coming soon');
  };

  const handleDeleteCompanyProduct = (product: CompanyProduct) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCompanyProduct = () => {
    if (productToDelete) {
      dispatch(deleteCompanyProductRequest(productToDelete.id));
      setProductToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };


  const handleViewCompanyProduct = (product: CompanyProduct) => {
    // Navigate to company product detail page
    if (onNavigate) {
      onNavigate(`/system/company-products/${product.id}`);
    } else if (onViewProduct) {
      onViewProduct(product.id);
    }
  };

  const handleViewVariant = (variant: any) => {
    // Navigate to product detail page with variant focus
    if (onNavigate) {
      onNavigate(`/system/company-products/${variant.companyProductId}?variant=${variant.id}`);
    } else {
      toast.info('Navigate to product detail page to view variant');
    }
  };

  const handleEditVariant = (variant: any) => {
    // Navigate to product detail page with variant focus
    if (onNavigate) {
      onNavigate(`/system/company-products/${variant.companyProductId}?variant=${variant.id}&edit=true`);
    } else {
      toast.info('Navigate to product detail page to edit variant');
    }
  };

  const handleDeleteVariant = (variant: any) => {
    if (confirm(`Are you sure you want to delete variant "${variant.name}"?`)) {
      // TODO: Implement variant deletion via Redux
      toast.info('Variant deletion will be implemented');
    }
  };

  const handleAddVariant = (product: CompanyProduct) => {
    // Navigate to product detail page to add variant
    if (onNavigate) {
      onNavigate(`/system/company-products/${product.id}?addVariant=true`);
    } else {
      toast.info('Navigate to product detail page to add variant');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case "Low Stock": return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
      case "Out of Stock": return "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30";
      case "Discontinued": return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
      default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "sell": return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "service": return "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "both": return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "sell": return "Sell Only";
      case "service": return "Service Use";
      case "both": return "Sell & Service";
      default: return type;
    }
  };

  // Fetch company currency
  useEffect(() => {
    const fetchCompanyCurrency = async () => {
      try {
        const companyId = user?.companyId || currentUser?.companyId;
        
        // Use userCompany if it matches the current user's companyId (cached)
        const company = companyId 
          ? ((userCompany && String(userCompany.id) === String(companyId)) 
              ? userCompany 
              : companies.find(c => String(c.id) === String(companyId)) || currentCompany)
          : null;
        const currencyId = (company as any)?.currencyId;
        
        if (currencyId) {
          const currency = await currenciesService.getCurrency(currencyId);
          setCompanyCurrency(currency);
        } else {
          // If no currency is set, fetch USD as default
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
  }, [user?.companyId, currentUser?.companyId, companies, currentCompany, userCompany]);

  const formatPrice = (price: number) => {
    const numPrice = Number(price) || 0;
    
    // Always use company currency (or USD default if no currency is set)
    if (companyCurrency) {
      const decimals = companyCurrency.decimals || 2;
      
      if (isNaN(numPrice)) {
        return `${companyCurrency.symbol} ${(0).toFixed(decimals)}`;
      }
      
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

  // Get role-specific actions for products
  const getRoleSpecificActions = (product: Product) => {
    const actions = {
      canEdit: false,
      canDelete: false,
      canViewDetails: false,
      canReorder: false,
      showSupplier: false
    };

    if (currentUser?.role === "Super Admin") {
      actions.canEdit = true;
      actions.canDelete = true;
      actions.canViewDetails = true;
      actions.showSupplier = true;
    } else if (currentUser?.role === "Company Owner") {
      actions.canViewDetails = true;
      actions.canReorder = true;
      actions.showSupplier = true;
      if (product.addedBy === "company" && product.companyId === currentUser.companyId) {
        actions.canEdit = true;
        actions.canDelete = true;
      }
    } else if (currentUser?.role === "Staff") {
      actions.canViewDetails = true;
      actions.canReorder = product.addedBy === "company" && product.companyId === currentUser.companyId;
    } else {
      // Regular users
      actions.canViewDetails = product.isAvailableForPurchase === true;
    }

    return actions;
  };

  const getPageTitle = () => {
    switch (currentUser?.role) {
      case "Super Admin":
        return "System Product Management";
      case "Company Owner":
        return "Company Product Inventory";
      case "Staff":
        return "Product Catalog";
      default:
        return "Available Products";
    }
  };

  const getPageDescription = () => {
    switch (currentUser?.role) {
      case "Super Admin":
        return "Manage the master product catalog available to all companies";
      case "Company Owner":
        return "Manage your company's product inventory and add new products from the system catalog";
      case "Staff":
        return "View and manage products used in your services";
      default:
        return "Browse products available for purchase and used in your services";
    }
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const actions = getRoleSpecificActions(product);
    const variantCount = product.variants?.length || 0;
    
    // List View Layout
    if (viewMode === "list") {
      return (
        <Card 
          className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)] cursor-pointer"
          onClick={() => {
            if (currentUser?.role === "Company Owner" && onViewProduct) {
              onViewProduct(product.id);
            }
          }}
        >
          <div className="flex items-start gap-4 mb-4">
            {/* Product Image */}
            <div className="flex-shrink-0 relative overflow-hidden rounded-lg">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-20 h-16 object-cover"
              />
              <div className="absolute top-1 right-1">
                <Badge className={`${getStatusColor(product.status)} text-xs border`}>
                  {product.status === "Active" ? "✓" : product.status === "Low Stock" ? "!" : "×"}
                </Badge>
              </div>
            </div>
            
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1 mr-2">
                  <h3 className="font-medium text-foreground text-base sm:text-lg truncate">{product.name}</h3>
                  <p className="text-[var(--accent-text)] text-sm truncate">{product.category}</p>
                  <p className="text-muted-foreground text-xs">SKU: {product.sku}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={`${getTypeColor(product.type)} border text-xs`}>
                    {getTypeLabel(product.type)}
                  </Badge>
                  {(actions.canEdit || actions.canDelete || actions.canViewDetails) && (
                    <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-accent text-muted-foreground hover:text-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{product.stock?.current || 0} {product.stock?.unit || 'pieces'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{formatPrice(product.price?.cost || 0)}</span>
                </div>
                {variantCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PackageCheck className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{variantCount} variant{variantCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {actions.showSupplier && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Store className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{product.supplier.name}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-foreground mb-3 line-clamp-1">{product.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {product.tags && product.tags.length > 0 && (
                    <>
                      {product.tags.slice(0, 3).map((tag, index) => {
                        // Handle both string tags (legacy) and Tag objects
                        const tagObj = typeof tag === 'string' 
                          ? { id: index, name: tag, color: '#3B82F6', icon: undefined }
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
                      {product.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.tags.length - 3}
                    </Badge>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {actions.canReorder && (
                    <Button size="sm" variant="outline" className="bg-accent/50 hover:bg-accent border-border text-foreground hover:text-foreground">
                      Reorder
                    </Button>
                  )}
                  {currentUser?.role === "User" && product.isAvailableForPurchase && (
                    <Button size="sm" variant="accent">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    // Grid View Layout (existing)
    return (
      <Card 
        className="overflow-hidden backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] group cursor-pointer"
        onClick={() => {
          if (currentUser?.role === "Company Owner" && onViewProduct) {
            onViewProduct(product.id);
          }
        }}
      >
        <div className="relative h-48 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge className={`${getTypeColor(product.type)} backdrop-blur-sm`}>
              {getTypeLabel(product.type)}
            </Badge>
          </div>
          <div className="absolute top-3 left-3 flex gap-1">
            <Badge className={`${getStatusColor(product.status)} backdrop-blur-sm border`}>
              {product.status}
            </Badge>
            {product.addedBy === "company" && (
              <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] backdrop-blur-sm border border-[var(--accent-border)]">
                Custom
              </Badge>
            )}
          </div>
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-black/50 text-white backdrop-blur-sm">
              {formatPrice(product.price?.cost || 0)}
            </Badge>
          </div>
          {currentUser?.role === "User" && product.isAvailableForPurchase && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-green-500/20 text-green-400 backdrop-blur-sm border border-green-500/30">
                <ShoppingCart className="w-3 h-3 mr-1" />
                Available
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-1">{product.name}</h3>
              <p className="text-[var(--accent-text)] text-sm">{product.category}</p>
              <p className="text-muted-foreground text-xs">SKU: {product.sku}</p>
            </div>
            {(actions.canEdit || actions.canDelete || actions.canViewDetails) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-card-foreground hover:bg-sidebar-accent">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border" align="end">
                  {actions.canViewDetails && (
                    <DropdownMenuItem className="text-popover-foreground hover:bg-sidebar-accent">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  )}
                  {actions.canEdit && (
                    <DropdownMenuItem className="text-popover-foreground hover:bg-sidebar-accent">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Product
                    </DropdownMenuItem>
                  )}
                  {actions.canReorder && (
                    <DropdownMenuItem className="text-popover-foreground hover:bg-sidebar-accent">
                      <Settings className="w-4 h-4 mr-2" />
                      Reorder Settings
                    </DropdownMenuItem>
                  )}
                  {actions.canDelete && (
                    <DropdownMenuItem className="text-red-500 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Stock:</span>
              <div className="flex items-center gap-2">
                <span className="text-card-foreground">{product.stock?.current || 0} {product.stock?.unit || 'pieces'}</span>
                {product.stock && product.stock.current <= (product.stock.minimum || 0) && (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                )}
              </div>
            </div>
            
            {actions.showSupplier && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cost Price:</span>
                <span className="text-card-foreground">{formatPrice(product.price?.cost || 0)}</span>
              </div>
            )}

            {product.price?.sell && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sell Price:</span>
                <span className="text-green-600 dark:text-green-400">{formatPrice(product.price.sell)}</span>
              </div>
            )}

            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
            
            {variantCount > 0 && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Variants:</span>
                <div className="flex items-center gap-1">
                  <PackageCheck className="w-4 h-4 text-[var(--accent-text)]" />
                  <span className="text-[var(--accent-text)] font-medium">{variantCount}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags && product.tags.length > 0 && (
              <>
                {product.tags.map((tag, index) => {
                  // Handle both string tags (legacy) and Tag objects
                  const tagObj = typeof tag === 'string' 
                    ? { id: index, name: tag, color: '#3B82F6', icon: undefined }
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
              </>
            )}
          </div>

          {(currentUser?.role === "Company Owner" || currentUser?.role === "Super Admin") && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-sidebar-accent">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[var(--accent-text)]" />
                  <span className="text-xs text-muted-foreground">Usage</span>
                </div>
                <p className="text-lg font-semibold text-card-foreground">{product.usage.thisMonth}</p>
                <div className="flex items-center gap-1 mt-1">
                  {product.usage.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : product.usage.trend === "down" ? (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-blue-500" />
                  )}
                  <span className="text-xs text-muted-foreground capitalize">{product.usage.trend}</span>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-sidebar-accent">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-[var(--accent-text)]" />
                  <span className="text-xs text-muted-foreground">Popularity</span>
                </div>
                <p className="text-lg font-semibold text-card-foreground">{product.popularity}</p>
                <p className="text-xs text-muted-foreground mt-1">Last restocked: {product.lastRestocked}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {actions.canReorder && (
              <Button size="sm" variant="outline" className="flex-1 border-border text-foreground hover:bg-accent hover:text-foreground">
                <Settings className="w-4 h-4 mr-1" />
                Reorder
              </Button>
            )}
            {currentUser?.role === "User" && product.isAvailableForPurchase && (
              <Button size="sm" variant="accent" className="flex-1">
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const loading = isCompanyOwner ? companyProductsLoading : false;

  if (loading && filteredProducts.length === 0) {
    return (
      <div className="flex-1 p-4 lg:p-6">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          
          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{getPageTitle()}</h1>
          <p className="text-muted-foreground mt-1">{getPageDescription()}</p>
        </div>
        {canAddProducts() && (
          <Button 
            onClick={() => setIsAddProductDialogOpen(true)}
            variant="accent"
            className="flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <div className="space-y-4">
            <SearchInput
            placeholder={isCompanyOwner 
              ? "Search products by name, description, or brand..."
              : "Search products by name, category, SKU, or tags..."
            }
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
                  <SelectItem key="all" value="all">All Categories</SelectItem>
                  {[...new Set(products.map(p => p.category).filter(Boolean))].map(category => (
                    <SelectItem key={category || 'uncategorized'} value={category || 'uncategorized'}>{category || 'Uncategorized'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sell">Sell Only</SelectItem>
                  <SelectItem value="service">Service Use</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  <SelectItem value="Discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || filterCategory !== "all" || filterType !== "all" || filterStatus !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setDebouncedSearchTerm("");
                    setFilterCategory("all");
                    setFilterType("all");
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

      {/* Products Grid/List */}
      {filteredProducts.length > 0 ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
          {isCompanyOwner ? (
            // Use CompanyProductCard for company owners
            filteredProducts.map((product) => (
              <CompanyProductCard
                key={product.id}
                product={product as CompanyProduct}
                viewMode={viewMode}
                onDelete={handleDeleteCompanyProduct}
                onView={handleViewCompanyProduct}
                onViewVariant={handleViewVariant}
                onEditVariant={handleEditVariant}
                onDeleteVariant={handleDeleteVariant}
              />
            ))
          ) : (
            // Use regular ProductCard for other roles
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product as Product} />
            ))
          )}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No products found"
          description={
            debouncedSearchTerm || filterCategory !== "all" || filterType !== "all" || filterStatus !== "all"
              ? "Try adjusting your filters to see more products"
              : "You don't have any products in your inventory yet"
            }
          action={
            canAddProducts()
              ? {
                  label: "Add Your First Product",
                  onClick: () => setIsAddProductDialogOpen(true),
                  variant: "accent",
                  icon: Plus,
                }
              : undefined
          }
        />
      )}

      {/* Pagination - Only for Company Owners */}
      {isCompanyOwner && pagination && pagination.total > 0 && (
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

      {/* Add Product Dialog */}
      {canAddProducts() && (
        <AddProductToCompanyDialog
          open={isAddProductDialogOpen}
          onOpenChange={setIsAddProductDialogOpen}
          onProductAdded={handleAddProduct}
          existingProductSKUs={getExistingProductSKUs()}
          currentUser={currentUser}
        />
      )}

      {/* Delete Confirmation Dialog for Company Products */}
      {isCompanyOwner && (
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDeleteCompanyProduct}
          itemType="Company Product"
          itemName={productToDelete?.name}
        />
      )}
    </div>
  );
}