import { useState, useEffect, useMemo } from "react";
import { Plus, Package, AlertTriangle, CheckCircle, Filter, Users } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { DeleteConfirmationDialog } from "../../../components/common/DeleteConfirmationDialog";
import { Pagination } from "../../../components/common/Pagination";
import { SearchInput } from "../../../components/common/SearchInput";
import { EmptyState } from "../../../components/common/EmptyState";
import { cn } from "../../../components/ui/utils";
import { CreateSystemProductDialog } from "./CreateSystemProductDialog";
import { ViewSwitcher } from "../../../components/ui/view-switcher";
import { Carousel, CarouselContent, CarouselItem } from "../../../components/ui/carousel";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { SystemProductCard } from "./SystemProductCard";
import { SystemProductListItem } from "./SystemProductListItem";
import { SystemProductFilters } from "./SystemProductFilters";
import { SystemProductAddEditDialog } from "./SystemProductAddEditDialog";
import {
  fetchSystemProductsRequest,
  updateSystemProductRequest,
  deleteSystemProductRequest,
  clearError as clearSystemProductsError,
} from "../../../store/slices/systemProductsSlice";
import {
  fetchCompanyProductsRequest,
  clearError as clearCompanyProductsError,
} from "../../../store/slices/companyProductsSlice";
import { fetchTagsRequest } from "../../../store/slices/tagsSlice";
import { Product, Tag } from "../../../services/products";
import { CompanyProduct } from "../../../services/companyProducts";

interface SystemProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  isVerified: boolean;
  usageCount: number; // How many companies are using this product
  createdDate: string;
  lastModified: string;
  tags: string[] | Tag[]; // Support both string array (legacy) and Tag objects
  // Company product specific fields (when viewing as company owner)
  companyProductId?: string;
  systemProductId?: string;
  type?: 'sell' | 'service' | 'both';
  costPrice?: number;
  sellPrice?: number;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  stockUnit?: string;
  isAvailableForPurchase?: boolean;
  notes?: string;
}

// Helper function to map Product from API to SystemProduct for UI
const mapProductToSystemProduct = (product: Product): SystemProduct => {
  // Ensure tags are properly handled - could be Tag objects or string array
  let tags: string[] | Tag[] = [];
  if (product.tags) {
    if (Array.isArray(product.tags)) {
      // Check if it's an array of strings or Tag objects
      if (product.tags.length > 0 && typeof product.tags[0] === 'string') {
        tags = product.tags as string[];
      } else {
        tags = product.tags as Tag[];
      }
    }
  }
  
  return {
    id: String(product.id),
    name: product.name,
    description: product.description || "",
    imageUrl: product.imageUrl || "",
    isActive: product.isActive,
    isVerified: product.isVerified ?? true,
    usageCount: product.usageCount || 0,
    createdDate: product.createdDate,
    lastModified: product.lastModified,
    tags: tags,
  };
};

// Mock data removed - now using Redux

import { UserRole, isRole } from "../../../types/user";

interface SystemProductsPageProps {
  currentUser?: {
    email: string;
    role: string | number | UserRole;
    name?: string;
    companyId?: string;
    id?: string;
  } | null;
  onViewProduct?: (productId: string) => void;
}

export function SystemProductsPage({ currentUser, onViewProduct }: SystemProductsPageProps) {
  const dispatch = useAppDispatch();
  const { systemProducts: productsFromRedux, loading: productsLoading, error: productsError } = useAppSelector((state) => state.systemProducts);
  const { companyProducts, loading: companyProductsLoading, error: companyProductsError } = useAppSelector((state) => state.companyProducts);
  const { tags } = useAppSelector((state) => state.tags);
  
  const isSuperAdmin = isRole(currentUser?.role, UserRole.SYSTEM_ADMIN);
  const isCompanyOwner = isRole(currentUser?.role, UserRole.COMPANY_OWNER);

  // Load tags when component mounts (for edit dialog)
  useEffect(() => {
    if (tags.length === 0) {
      dispatch(fetchTagsRequest({ active: true }));
    }
  }, [dispatch, tags.length]);

  // Only Super Admin and Company Owners can access this page
  if (!isSuperAdmin && !isCompanyOwner) {
    return (
      <div className="flex-1 p-4 lg:p-8 min-h-screen">
        <Card className="p-12 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            Only Super Administrators and Company Owners can access the System Products page.
          </p>
        </Card>
      </div>
    );
  }

  // State declarations - must be before useEffect that uses them
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [selectedProduct, setSelectedProduct] = useState<SystemProduct | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<SystemProduct | null>(null);
  const [editFormData, setEditFormData] = useState({
    // Removed brand field
    name: "",
    description: "",
    imageUrl: "",
    isActive: true,
    tagIds: [] as string[]
  });

  // Load products on mount and when filters/pagination change
  useEffect(() => {
    // Wait for currentUser to be available
    if (!currentUser) {
      return;
    }

    if (isSuperAdmin) {
      // Super Admin sees all system products with pagination
      const offset = (currentPage - 1) * itemsPerPage;
      const filters: any = {
        limit: itemsPerPage,
        offset: offset,
        page: currentPage,
      };

      // Add search (use debounced value to avoid too many API calls)
      if (debouncedSearchTerm.trim()) {
        filters.search = debouncedSearchTerm.trim();
      }

      // Add status filter
      if (statusFilter === "active") {
        filters.isActive = true;
      } else if (statusFilter === "inactive") {
        filters.isActive = false;
      }

      // Add verified filter
      if (verifiedFilter === "verified") {
        filters.isVerified = true;
      } else if (verifiedFilter === "unverified") {
        filters.isVerified = false;
      }

      // Add tag filters
      if (selectedTagIds.length > 0) {
        filters.tagIds = selectedTagIds;
      }

      dispatch(fetchSystemProductsRequest(filters));
    } else if (isCompanyOwner) {
      const companyId = (currentUser as any).companyId;
      if (companyId) {
        // Company Owner sees their company products (which include system product details via join)
        // Note: Company products might need separate pagination implementation
        dispatch(fetchCompanyProductsRequest({ companyId }));
      }
    }
  }, [dispatch, isSuperAdmin, isCompanyOwner, currentUser, currentPage, itemsPerPage, debouncedSearchTerm, statusFilter, verifiedFilter, selectedTagIds]);

  // Handle system products errors
  useEffect(() => {
    if (productsError) {
      toast.error(productsError);
      dispatch(clearSystemProductsError());
    }
  }, [productsError, dispatch]);

  // Handle company products errors
  useEffect(() => {
    if (companyProductsError) {
      toast.error(companyProductsError);
      dispatch(clearCompanyProductsError());
    }
  }, [companyProductsError, dispatch]);

  // Map products from Redux to SystemProduct format
  // For Super Admin: show system products
  // For Company Owner: show company products (with system product details from join)
  const systemProducts = useMemo(() => {
    if (isSuperAdmin) {
      return productsFromRedux.map(product => mapProductToSystemProduct(product));
    } else if (isCompanyOwner) {
      // Map company products to SystemProduct format
      // Company products already have system product data from the join (name, description, sku, imageUrl)
      return companyProducts.map((cp: CompanyProduct) => ({
        id: cp.id,
        name: cp.name || 'Unknown Product',
        description: cp.description || '',
        sku: cp.sku || '',
        imageUrl: cp.imageUrl || '',
        isActive: cp.isAvailableForPurchase ?? true,
        isVerified: (cp as any).isVerified ?? true, // Get from system product join if available
        usageCount: 0, // Not applicable for company products
        createdDate: cp.createdAt || '',
        lastModified: cp.updatedAt || '',
        tags: cp.tags?.map(tag => typeof tag === 'object' ? tag.name : tag) || [],
        // Company-specific data
        companyProductId: cp.id,
        systemProductId: cp.systemProductId,
        type: (cp as any).type,
        costPrice: (cp as any).costPrice,
        sellPrice: (cp as any).sellPrice,
        currentStock: (cp as any).currentStock,
        minStock: (cp as any).minStock,
        maxStock: (cp as any).maxStock,
        stockUnit: (cp as any).stockUnit,
        isAvailableForPurchase: cp.isAvailableForPurchase,
        notes: (cp as any).notes,
      }));
    }
    return [];
  }, [productsFromRedux, companyProducts, isSuperAdmin, isCompanyOwner]);
  const loading = productsLoading || companyProductsLoading;

  // Get pagination metadata from Redux
  const { pagination } = useAppSelector((state) => state.systemProducts);
  
  // For Super Admin: use products from Redux (already paginated by API)
  // For Company Owner: use company products (may need separate pagination later)
  const displayedProducts = isSuperAdmin ? systemProducts : systemProducts;

  // Reset to page 1 when filters change (but not when pagination changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, verifiedFilter, selectedTagIds]);

  // Statistics - these would ideally come from a separate stats endpoint
  // For now, we'll calculate from current page data (limited accuracy)
  const totalProducts = pagination?.total || systemProducts.length;
  const activeProducts = systemProducts.filter(p => p.isActive).length;
  const totalUsage = systemProducts.reduce((sum, p) => sum + p.usageCount, 0);

  const handleCreateProduct = (_productData: any) => {
    // Product is already created by CreateSystemProductDialog
    // Just refresh the products list
    dispatch(fetchSystemProductsRequest());
  };

  const handleEditProduct = (product: SystemProduct) => {
    setSelectedProduct(product);
    
    // Get the product from Redux to get the actual imageUrl, sku, and isActive
    const productFromRedux = productsFromRedux.find(p => String(p.id) === product.id);
    
    // Convert tags array to tagIds array
    const tagIds = Array.isArray(product.tags) 
      ? product.tags.map(tag => {
          if (typeof tag === 'string') {
            // Find tag by name in tags list
            const foundTag = tags.find(t => t.name === tag);
            return foundTag?.id || '';
          } else {
            return tag.id || '';
          }
        }).filter((id): id is string => Boolean(id) && typeof id === 'string' && id.length === 10)
      : [];
    
    setEditFormData({
      // Removed brand field
      name: product.name,
      description: product.description,
      imageUrl: productFromRedux?.imageUrl || product.imageUrl || "",
      isActive: product.isActive,
      tagIds: tagIds
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = () => {
    if (!selectedProduct) return;

    if (!editFormData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    const updateData = {
      // Removed brand field
      name: editFormData.name.trim(),
      description: editFormData.description || undefined,
      imageUrl: editFormData.imageUrl || undefined,
      isActive: editFormData.isActive,
      tagIds: editFormData.tagIds.length > 0 ? editFormData.tagIds : undefined
    };

    dispatch(updateSystemProductRequest({ id: selectedProduct.id, data: updateData }));
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
  };


  const handleImageUploaded = (filePath: string, _fileUrl: string) => {
    // Update the image URL in the form data
    setEditFormData(prev => ({ ...prev, imageUrl: filePath }));
  };

  const handleImageDeleted = () => {
    // Remove the image from the form data
    setEditFormData(prev => ({ ...prev, imageUrl: "" }));
  };

  const handleDeleteProduct = (product: SystemProduct) => {
    if (product.usageCount > 0) {
      toast.error("Cannot delete product that is being used by companies");
      return;
    }
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = () => {
    if (!productToDelete) return;
    
    dispatch(deleteSystemProductRequest(productToDelete.id));
    setIsDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const toggleProductStatus = (productId: string) => {
    const product = productsFromRedux.find(p => String(p.id) === productId);
    if (!product) return;
    
    dispatch(updateSystemProductRequest({ 
      id: productId, 
      data: { isActive: !product.isActive } 
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setStatusFilter("all");
    setVerifiedFilter("all");
    setSelectedTagIds([]);
  };

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">System Products</h1>
            <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              <Package className="w-3 h-3 mr-1" />
              Super Admin
            </Badge>
          </div>
          <p className="text-muted-foreground">Manage the master product catalog for all companies</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            variant="accent"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards - Desktop Only */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                <Package className="w-6 h-6 text-[var(--accent-button-text)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-xl font-semibold text-foreground">{totalProducts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-xl font-semibold text-foreground">{activeProducts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Usage</p>
                <p className="text-xl font-semibold text-foreground">{totalUsage}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile & Tablet: Carousel - Horizontal scroll with same layout as desktop */}
      <div className="block lg:hidden">
        <Carousel
          opts={{
            align: "start",
            slidesToScroll: 1,
            containScroll: "trimSnaps",
          }}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            {[
              { label: "Total Products", value: totalProducts, icon: Package, gradient: "from-[var(--accent-primary)] to-[var(--accent-secondary)]", iconColor: "text-[var(--accent-button-text)]" },
              { label: "Active", value: activeProducts, icon: CheckCircle, gradient: "from-green-500 to-green-600", iconColor: "text-white" },
              { label: "Total Usage", value: totalUsage, icon: Users, gradient: "from-purple-500 to-purple-600", iconColor: "text-white" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              const isLast = index === 2;
              return (
                <CarouselItem key={index} className={`pl-0 ${isLast ? 'pr-4' : 'pr-2'} flex-shrink-0`} style={{ minWidth: '40vw', width: 'auto' }}>
                  <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-xl font-semibold text-foreground">{stat.value}</p>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        <div className="space-y-4">
          {/* Search */}
          <SearchInput
            placeholder="Search products by name, tags, or description..."
            value={searchTerm}
            onChange={setSearchTerm}
            onDebouncedChange={setDebouncedSearchTerm}
            debounceDelay={500}
          />

          {/* Filter Button and View Switcher - All aligned to right */}
          <div className="flex items-center justify-end gap-3 flex-wrap">
            {/* Filter Button */}
            <Button 
              variant="outline" 
              onClick={() => setIsFilterPanelOpen(true)}
              className={cn(
                "h-9",
                (debouncedSearchTerm || statusFilter !== "all" || verifiedFilter !== "all" || selectedTagIds.length > 0)
                  ? "bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent-text)] hover:bg-[var(--accent-primary)] hover:border-[var(--accent-primary)]"
                  : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
              )}
            >
              <Filter className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>

            {/* View Switcher */}
            <ViewSwitcher
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      </Card>

      {/* Products Grid/List */}
      {loading && displayedProducts.length === 0 ? (
        <>
          {viewMode === "list" ? (
            /* Skeleton for List View - Matching ProductCard structure */
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-20 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1 mr-2">
                          <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
                      <div className="flex flex-wrap gap-1">
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-6 w-18 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Skeleton for Grid View - Matching ProductCard structure */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700 animate-pulse">
                    <div className="absolute top-3 right-3 flex gap-1">
                      <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                      <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                    </div>
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : displayedProducts.length > 0 ? (
        <>
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
            {displayedProducts.map((product) => (
              viewMode === "list" ? (
                <SystemProductListItem
                  key={product.id}
                  product={product}
                  onViewProduct={onViewProduct}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleStatus={toggleProductStatus}
                />
              ) : (
                <SystemProductCard
                  key={product.id}
                  product={product}
                  onViewProduct={onViewProduct}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleStatus={toggleProductStatus}
                />
              )
            ))}
          </div>

          {/* Pagination */}
          {isSuperAdmin && pagination && (
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
        </>
      ) : (
        <EmptyState
          icon={Package}
          title="No products found"
          description={
            debouncedSearchTerm || statusFilter !== "all" || verifiedFilter !== "all" || selectedTagIds.length > 0
              ? "Try adjusting your filters to see more products"
              : isCompanyOwner 
                ? "No products have been added to your company yet. Add products from the system products catalog."
                : "No system products have been created yet"
          }
          action={
            !isCompanyOwner
              ? {
                  label: "Create Your First Product",
                  onClick: () => setIsCreateDialogOpen(true),
                  variant: "accent",
                  icon: Plus,
                }
              : undefined
          }
        />
      )}

      {/* Create Product Dialog */}
      <CreateSystemProductDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onProductCreated={handleCreateProduct}
      />

      {/* Edit Product Dialog */}
      <SystemProductAddEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={editFormData}
        onFormDataChange={setEditFormData}
        onSubmit={handleUpdateProduct}
        onImageUploaded={handleImageUploaded}
        onImageDeleted={handleImageDeleted}
        loading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setProductToDelete(null);
          }
        }}
        onConfirm={confirmDeleteProduct}
        itemType="System Product"
        itemName={productToDelete?.name}
        isLoading={loading}
      />

      {/* Filter Right Panel */}
      <SystemProductFilters
        open={isFilterPanelOpen}
        onOpenChange={setIsFilterPanelOpen}
        statusFilter={statusFilter}
        verifiedFilter={verifiedFilter}
        selectedTagIds={selectedTagIds}
        onStatusFilterChange={setStatusFilter}
        onVerifiedFilterChange={setVerifiedFilter}
        onTagIdsChange={setSelectedTagIds}
        onClearFilters={handleClearFilters}
        hasActiveFilters={!!(debouncedSearchTerm || statusFilter !== "all" || verifiedFilter !== "all" || selectedTagIds.length > 0)}
        resultsCount={displayedProducts.length}
      />
    </div>
  );
}
