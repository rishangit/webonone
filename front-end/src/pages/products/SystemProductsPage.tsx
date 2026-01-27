import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, MoreVertical, Package, Eye, Settings, AlertTriangle, CheckCircle, Filter, SortAsc, Star, Users, List, LayoutGrid, Grid, Tag } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "../../components/common/DeleteConfirmationDialog";
import { Pagination } from "../../components/common/Pagination";
import { SearchInput } from "../../components/common/SearchInput";
import { EmptyState } from "../../components/common/EmptyState";
import { CreateSystemProductDialog } from "./CreateSystemProductDialog";
import { DialogWithFixedHeader } from "../../components/ui/dialog-with-fixed-header";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { TagSelector } from "../../components/tags/TagSelector";
import { Separator } from "../../components/ui/separator";
import { useIsMobile } from "../../components/ui/use-mobile";
import { ViewSwitcher } from "../../components/ui/view-switcher";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import FileUpload from "../../components/ui/file-upload";
import { formatAvatarUrl } from "../../utils";
import { DateDisplay } from "../../components/common/DateDisplay";
import {
  fetchSystemProductsRequest,
  createSystemProductRequest,
  updateSystemProductRequest,
  deleteSystemProductRequest,
  clearError as clearSystemProductsError,
} from "../../store/slices/systemProductsSlice";
import {
  fetchCompanyProductsRequest,
  clearError as clearCompanyProductsError,
} from "../../store/slices/companyProductsSlice";
import { fetchTagsRequest } from "../../store/slices/tagsSlice";
import { Product } from "../../services/products";
import { CompanyProduct } from "../../services/companyProducts";

interface Tag {
  id: number;
  name: string;
  color: string;
  icon?: string;
}

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
  let tags: (string | Tag)[] = [];
  if (product.tags) {
    if (Array.isArray(product.tags)) {
      tags = product.tags;
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

import { UserRole, isRole } from "../../types/user";

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
  const navigate = useNavigate();
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<SystemProduct | null>(null);
  const [editFormData, setEditFormData] = useState({
    brand: "",
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
        type: cp.type,
        costPrice: cp.costPrice,
        sellPrice: cp.sellPrice,
        currentStock: cp.currentStock,
        minStock: cp.minStock,
        maxStock: cp.maxStock,
        stockUnit: cp.stockUnit,
        isAvailableForPurchase: cp.isAvailableForPurchase,
        notes: cp.notes,
      }));
    }
    return [];
  }, [productsFromRedux, companyProducts, isSuperAdmin, isCompanyOwner]);
  const loading = productsLoading || companyProductsLoading;
  const isMobile = useIsMobile();

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
    
    // Get the product from Redux to get the actual imageUrl, brand, sku, and isActive
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
      brand: productFromRedux?.brand || "",
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
      brand: editFormData.brand.trim() || undefined,
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
      id: parseInt(productId, 10), 
      data: { isActive: !product.isActive } 
    }));
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "$0.00";
    }
    return `$${price.toFixed(2)}`;
  };

  const ProductCard = ({ product }: { product: SystemProduct }) => {
    const handleCardClick = () => {
      navigate(`/system/system-products/${product.id}`);
    };

    if (viewMode === "list") {
      return (
        <Card 
          className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)] cursor-pointer"
          onClick={handleCardClick}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <ImageWithFallback
                src={product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : formatAvatarUrl(product.imageUrl)) : undefined}
                alt={product.name}
                className="w-20 h-16 object-cover rounded-lg"
                fallbackSrc="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=64&fit=crop"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1 mr-2">
                  <h3 className="font-medium text-foreground text-base sm:text-lg truncate">{product.name}</h3>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={product.isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge className={product.isVerified ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30" : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30"}>
                    {product.isVerified ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Unverified
                      </>
                    )}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 hover:bg-accent text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-popover border-border" align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewProduct?.(product.id); }}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Product
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleProductStatus(product.id); }}>
                        <Settings className="w-4 h-4 mr-2" />
                        {product.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product); }}
                        className="text-red-600 dark:text-red-400"
                        disabled={product.usageCount > 0}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{product.usageCount} companies</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate"><DateDisplay date={product.lastModified} /></span>
                </div>
              </div>

              <p className="text-sm text-foreground mb-3 line-clamp-2">{product.description}</p>

              {/* Tags Section */}
              <div className="flex flex-wrap gap-1">
                {product.tags && product.tags.length > 0 ? (
                  <>
                    {product.tags.slice(0, 4).map((tag, index) => {
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
                {product.tags.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{product.tags.length - 4} more
                  </Badge>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Tag className="w-3 h-3" />
                    <span>No tags</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      );
    }

    // Grid View
    return (
      <Card 
        className="overflow-hidden backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] group cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative h-48 overflow-hidden">
          <ImageWithFallback
            src={product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : formatAvatarUrl(product.imageUrl)) : undefined}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            fallbackSrc="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"
          />
          <div className="absolute top-3 right-3 flex gap-1 flex-wrap">
            <Badge className={product.isActive ? "bg-green-500/20 text-green-400 backdrop-blur-sm border border-green-500/30" : "bg-gray-500/20 text-gray-400 backdrop-blur-sm border border-gray-500/30"}>
              {product.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge className={product.isVerified ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 backdrop-blur-sm border border-purple-500/30" : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 backdrop-blur-sm border border-yellow-500/30"}>
              {product.isVerified ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unverified
                </>
              )}
            </Badge>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-card-foreground mb-1 truncate">{product.name}</h3>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-card-foreground hover:bg-sidebar-accent flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border-border" align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewProduct?.(product.id); }}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Product
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleProductStatus(product.id); }}>
                  <Settings className="w-4 h-4 mr-2" />
                  {product.isActive ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product); }}
                  className="text-red-500 hover:bg-red-500/10"
                  disabled={product.usageCount > 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Usage:</span>
              <span className="text-card-foreground">{product.usageCount} companies</span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          </div>

          {/* Tags Section */}
          <div className="mb-4">
            {product.tags && product.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
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
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Tag className="w-3 h-3" />
                <span>No tags assigned</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Modified: <DateDisplay date={product.lastModified} /></span>
              <span>ID: {product.id}</span>
            </div>
          </div>
        </div>
      </Card>
    );
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

      {/* Stats Cards */}
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

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                <SelectTrigger className="w-full sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Verified</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || statusFilter !== "all" || verifiedFilter !== "all" || selectedTagIds.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setVerifiedFilter("all");
                    setSelectedTagIds([]);
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
      {displayedProducts.length > 0 ? (
        <>
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
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
      <CustomDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        title="Edit System Product"
        description="Update product information and settings"
        icon={<Package className="w-5 h-5" />}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              size="default"
              className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProduct}
              size="default"
              variant="accent"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Product"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Brand */}
          <div className="space-y-2">
            <Label className="text-foreground">Brand</Label>
            <Input
              value={editFormData.brand}
              onChange={(e) => setEditFormData(prev => ({ ...prev, brand: e.target.value }))}
              placeholder="Enter brand name"
              className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
            />
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label className="text-foreground">Product Name *</Label>
            <Input
              value={editFormData.name}
              onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Product name"
              className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground text-lg py-3"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-foreground">Description</Label>
            <Textarea
              value={editFormData.description}
              onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="High-quality nitrile examination gloves for medical procedures"
              className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground min-h-[80px]"
              rows={3}
            />
          </div>

          {/* SKU */}
          {/* Product Image */}
          <div className="space-y-2">
            <Label className="text-foreground">Product Image</Label>
            <FileUpload
              onFileUploaded={handleImageUploaded}
              onFileDeleted={handleImageDeleted}
              currentImagePath={editFormData.imageUrl}
              currentImageUrl={editFormData.imageUrl ? formatAvatarUrl(editFormData.imageUrl) : undefined}
              folderPath="products"
              label="Upload Product Image"
              maxSize={5}
              className="w-full"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-foreground">Tags</Label>
            <TagSelector
              value={editFormData.tagIds}
              onChange={(tagIds) => {
                setEditFormData(prev => ({ ...prev, tagIds }));
              }}
              placeholder="Select tags for this product"
            />
            <p className="text-xs text-muted-foreground">
              Select one or more tags that best describe this product. You can search for tags in the dropdown.
            </p>
          </div>

          {/* Active Status */}
          <div className="space-y-2">
            <Label className="text-foreground">Status</Label>
            <Select 
              value={editFormData.isActive ? "active" : "inactive"} 
              onValueChange={(value) => setEditFormData(prev => ({ ...prev, isActive: value === "active" }))}
            >
              <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CustomDialog>

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
    </div>
  );
}