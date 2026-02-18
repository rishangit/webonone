import { useState, useEffect } from "react";
import { ArrowLeft, Package, Tag, Edit, Save, X, DollarSign, TrendingUp, AlertTriangle, CheckCircle, PackageCheck, Plus, Trash2, Eye, MoreVertical, Star, Warehouse } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { useIsMobile } from "../../components/ui/use-mobile";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { 
  fetchCompanyProductRequest, 
  updateCompanyProductRequest,
  clearError as clearCompanyProductsError 
} from "../../store/slices/companyProductsSlice";
import { fetchSystemProductRequest } from "../../store/slices/systemProductsSlice";
import { CompanyProduct } from "../../services/companyProducts";
import { CompanyProductVariant } from "../../services/companyProductVariants";
import { companyProductVariantsService } from "../../services/companyProductVariants";
import { formatAvatarUrl } from "../../utils";
import { toast } from "sonner";
import { VariantForm } from "../../components/products/VariantForm";
import { VariantFormData } from "../../schemas/variantValidation";
import { VariantDialog } from "../../components/products/VariantDialog";
import { SystemProductVariantSelector } from "../../components/products/SystemProductVariantSelector";
import { ProductVariant as SystemProductVariant } from "../../services/productVariants";
import { DeleteConfirmationDialog } from "../../components/common/DeleteConfirmationDialog";
import { currenciesService, Currency } from "../../services/currencies";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { systemProductAttributesService, SystemProductAttribute } from "../../services/systemProductAttributes";
import { unitsOfMeasureService, UnitsOfMeasure } from "../../services/unitsOfMeasure";

interface CompanyProductDetailPageProps {
  productId: string;
  onBack: () => void;
}

// Use CompanyProductVariant type for variants
type ProductVariant = CompanyProductVariant;

export const CompanyProductDetailPage = ({ productId, onBack }: CompanyProductDetailPageProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<CompanyProductVariant | null>(null);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [variantDialogMode, setVariantDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [variantDialogVariant, setVariantDialogVariant] = useState<CompanyProductVariant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<CompanyProductVariant | null>(null);
  
  // Redux state
  const { currentCompanyProduct, loading, error } = useAppSelector((state) => state.companyProducts);
  const { currentSystemProduct } = useAppSelector((state) => state.systemProducts);
  const { user } = useAppSelector((state) => state.auth);
  const { companies, currentCompany } = useAppSelector((state) => state.companies);
  const [variants, setVariants] = useState<CompanyProductVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);
  const [systemAttributes, setSystemAttributes] = useState<SystemProductAttribute[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitsOfMeasure[]>([]);
  const [attributesLoading, setAttributesLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: 'service' as 'sell' | 'service' | 'both',
    costPrice: 0,
    sellPrice: undefined as number | undefined,
    currentStock: 0,
    minStock: 10,
    maxStock: 100,
    stockUnit: 'pieces',
    isAvailableForPurchase: false,
    notes: ''
  });

  // Fetch company product and system product
  useEffect(() => {
    dispatch(fetchCompanyProductRequest(productId));
  }, [dispatch, productId]);

  // Fetch system product when company product is loaded
  useEffect(() => {
    if (currentCompanyProduct?.systemProductId) {
      dispatch(fetchSystemProductRequest(currentCompanyProduct.systemProductId));
    }
  }, [dispatch, currentCompanyProduct?.systemProductId]);

  // Fetch variants separately to ensure we have latest data with price and stock
  useEffect(() => {
    const fetchVariants = async () => {
      if (!currentCompanyProduct?.id) return;
      setVariantsLoading(true);
      try {
        const fetchedVariants = await companyProductVariantsService.getVariantsByCompanyProductId(currentCompanyProduct.id);
        setVariants(fetchedVariants);
      } catch (error) {
        console.error('Error fetching variants:', error);
        // Fallback to variants from company product if available
        if (currentCompanyProduct?.variants) {
          setVariants(currentCompanyProduct.variants as CompanyProductVariant[]);
        }
      } finally {
        setVariantsLoading(false);
      }
    };
    fetchVariants();
  }, [currentCompanyProduct?.id]);

  // Update form data when product is loaded
  useEffect(() => {
    if (currentCompanyProduct) {
      setFormData({
        type: currentCompanyProduct.type || 'service',
        costPrice: Number(currentCompanyProduct.costPrice) || 0,
        sellPrice: currentCompanyProduct.sellPrice ? Number(currentCompanyProduct.sellPrice) : undefined,
        currentStock: Number(currentCompanyProduct.currentStock) || 0,
        minStock: Number(currentCompanyProduct.minStock) || 10,
        maxStock: Number(currentCompanyProduct.maxStock) || 100,
        stockUnit: currentCompanyProduct.stockUnit || 'pieces',
        isAvailableForPurchase: currentCompanyProduct.isAvailableForPurchase ?? false,
        notes: currentCompanyProduct.notes || ''
      });
    }
  }, [currentCompanyProduct]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearCompanyProductsError());
    };
  }, [dispatch]);

  // Handle form changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate margin
  const calculateMargin = () => {
    if (formData.costPrice && formData.sellPrice) {
      return ((formData.sellPrice - formData.costPrice) / formData.costPrice * 100).toFixed(1);
    }
    return null;
  };

  // Handle save
  const handleSave = () => {
    if (!currentCompanyProduct) return;

    const margin = formData.costPrice && formData.sellPrice
      ? ((formData.sellPrice - formData.costPrice) / formData.costPrice * 100)
      : undefined;

    const updateData = {
      type: formData.type,
      costPrice: formData.costPrice,
      sellPrice: formData.sellPrice,
      margin,
      currentStock: formData.currentStock,
      minStock: formData.minStock,
      maxStock: formData.maxStock,
      stockUnit: formData.stockUnit,
      isAvailableForPurchase: formData.isAvailableForPurchase,
      notes: formData.notes || undefined
    };

    dispatch(updateCompanyProductRequest({ id: currentCompanyProduct.id, data: updateData }));
    setIsEditing(false);
  };

  // Handle cancel
  const handleCancel = () => {
    if (currentCompanyProduct) {
      setFormData({
        type: currentCompanyProduct.type || 'service',
        costPrice: Number(currentCompanyProduct.costPrice) || 0,
        sellPrice: currentCompanyProduct.sellPrice ? Number(currentCompanyProduct.sellPrice) : undefined,
        currentStock: Number(currentCompanyProduct.currentStock) || 0,
        minStock: Number(currentCompanyProduct.minStock) || 10,
        maxStock: Number(currentCompanyProduct.maxStock) || 100,
        stockUnit: currentCompanyProduct.stockUnit || 'pieces',
        isAvailableForPurchase: currentCompanyProduct.isAvailableForPurchase ?? false,
        notes: currentCompanyProduct.notes || ''
      });
    }
    setIsEditing(false);
  };


  // Handle remove variant
  const handleRemoveVariant = async (variantId: string) => {
    try {
      await companyProductVariantsService.deleteVariant(variantId);
      toast.success("Variant removed successfully");
      dispatch(fetchCompanyProductRequest(productId));
      if (currentCompanyProduct?.id) {
        const fetchedVariants = await companyProductVariantsService.getVariantsByCompanyProductId(currentCompanyProduct.id);
        setVariants(fetchedVariants);
      }
      if (selectedVariant?.id === variantId) {
        setSelectedVariant(null);
      }
      setDeleteDialogOpen(false);
      setVariantToDelete(null);
    } catch (error: any) {
      console.error('Error removing variant:', error);
      toast.error(error?.message || "Failed to remove variant");
    }
  };

  const handleDeleteClick = (variant: CompanyProductVariant) => {
    setVariantToDelete(variant);
    setDeleteDialogOpen(true);
  };

  // Handle update variant
  const handleUpdateVariant = async (variantId: string, updates: Partial<ProductVariant>) => {
    try {
      await companyProductVariantsService.updateVariant(variantId, updates);
      toast.success("Variant updated successfully");
      dispatch(fetchCompanyProductRequest(productId));
      if (currentCompanyProduct?.id) {
        const fetchedVariants = await companyProductVariantsService.getVariantsByCompanyProductId(currentCompanyProduct.id);
        setVariants(fetchedVariants);
      }
    } catch (error: any) {
      console.error('Error updating variant:', error);
      toast.error(error?.message || "Failed to update variant");
    }
  };

  // Handle set as default variant
  const handleSetAsDefault = async (variant: CompanyProductVariant) => {
    try {
      await handleUpdateVariant(variant.id, { isDefault: true });
      toast.success("Default variant updated successfully");
    } catch (error: any) {
      console.error('Error setting default variant:', error);
      toast.error(error?.message || "Failed to set default variant");
    }
  };

  // Handle view variant
  const handleViewVariant = (variant: CompanyProductVariant) => {
    setVariantDialogVariant(variant);
    setVariantDialogMode('view');
    setVariantDialogOpen(true);
  };

  // Handle edit variant - open edit dialog
  const handleEditVariant = (variant: CompanyProductVariant) => {
    setVariantDialogVariant(variant);
    setVariantDialogMode('edit');
    setVariantDialogOpen(true);
  };

  // Handle add variant - open add dialog
  const handleAddVariant = () => {
    setVariantDialogVariant(null);
    setVariantDialogMode('add');
    setVariantDialogOpen(true);
  };

  // Handle save variant from dialog
  const handleSaveVariant = async (variantData: VariantFormData) => {
    if (!currentCompanyProduct?.id) {
      toast.error("Product ID is missing");
      return;
    }

    if (variantDialogMode === 'add') {
      // For system products, require systemProductVariantId
      if (currentCompanyProduct.systemProductId && !variantData.systemProductVariantId) {
        toast.error("Please select a system product variant");
        return;
      }

      // For custom products, require name
      if (!currentCompanyProduct.systemProductId && !variantData.name) {
        toast.error("Variant name is required");
        return;
      }

      try {
        // Check if this will be the only variant - if so, set as default
        const existingVariants = await companyProductVariantsService.getVariantsByCompanyProductId(currentCompanyProduct.id);
        const willBeOnlyVariant = existingVariants.length === 0;
        
        const newVariantData: any = {
          companyProductId: currentCompanyProduct.id,
          type: variantData.type || 'service',
          isActive: true,
          isDefault: willBeOnlyVariant ? true : (variantData.isDefault || false)
        };

        // For system products, add systemProductVariantId
        if (currentCompanyProduct.systemProductId && variantData.systemProductVariantId) {
          newVariantData.systemProductVariantId = variantData.systemProductVariantId;
        } else if (!currentCompanyProduct.systemProductId) {
          // For custom products, add variant details
          const size = variantData.size && variantData.sizeUnit 
            ? `${variantData.size}${variantData.sizeUnit}` 
            : variantData.size || undefined;
          const weight = variantData.weight && variantData.weightUnit 
            ? `${variantData.weight}${variantData.weightUnit}` 
            : variantData.weight || undefined;
          
          newVariantData.name = variantData.name;
          newVariantData.color = variantData.color || undefined;
          newVariantData.size = size;
          newVariantData.weight = weight;
          newVariantData.material = variantData.material || undefined;
        }

        await companyProductVariantsService.createVariant(newVariantData);
        toast.success("Variant added successfully");
        
        // Refresh product data and variants
        dispatch(fetchCompanyProductRequest(productId));
        const fetchedVariants = await companyProductVariantsService.getVariantsByCompanyProductId(currentCompanyProduct.id);
        setVariants(fetchedVariants);
      } catch (error: any) {
        console.error('Error adding variant:', error);
        toast.error(error?.message || "Failed to add variant");
        throw error;
      }
    } else if (variantDialogMode === 'edit' && variantDialogVariant) {
      const updates: any = {
        type: variantData.type || 'service',
        isDefault: variantData.isDefault || false
      };

      // For custom products (no systemProductId), allow updating variant details
      if (!currentCompanyProduct?.systemProductId) {
        const size = variantData.size && variantData.sizeUnit 
          ? `${variantData.size}${variantData.sizeUnit}` 
          : variantData.size || undefined;
        const weight = variantData.weight && variantData.weightUnit 
          ? `${variantData.weight}${variantData.weightUnit}` 
          : variantData.weight || undefined;
        
        updates.name = variantData.name;
        updates.color = variantData.color || undefined;
        updates.size = size;
        updates.weight = weight;
        updates.material = variantData.material || undefined;
      }

      await handleUpdateVariant(variantDialogVariant.id, updates);
    }
  };

  // Handle view variant
  const handleViewStockDetails = (variant: CompanyProductVariant) => {
    navigate(`/system/company-products/${productId}/variants/${variant.id}/stock`);
  };

  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariant(selectedVariant?.id === variant.id ? null : variant);
  };

  // Fetch all system product attributes
  useEffect(() => {
    const fetchSystemAttributes = async () => {
      setAttributesLoading(true);
      try {
        const [attributesResult, unitsResult] = await Promise.all([
          systemProductAttributesService.getAttributes({
            isActive: true,
            limit: 1000,
          }),
          unitsOfMeasureService.getActiveUnits(),
        ]);
        setSystemAttributes(attributesResult.attributes);
        setUnitsOfMeasure(unitsResult);
      } catch (error: any) {
        console.error("Error fetching system attributes:", error);
        toast.error(error.message || "Failed to load system attributes");
      } finally {
        setAttributesLoading(false);
      }
    };
    fetchSystemAttributes();
  }, []);

  // Fetch company currency
  useEffect(() => {
    const fetchCompanyCurrency = async () => {
      try {
        const companyId = user?.companyId;
        
        // Find company from Redux store
        const company = companyId 
          ? (companies.find(c => String(c.id) === String(companyId)) || currentCompany)
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
  }, [user?.companyId, companies, currentCompany]);

  // Format price helper
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
    // Replace $ with $  to add space
    return formatted.replace('$', '$ ');
  };

  if (loading && !currentCompanyProduct) {
    return (
      <div className="flex-1 p-4 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error && !currentCompanyProduct) {
    return (
      <div className="flex-1 p-4 lg:p-8 min-h-screen flex items-center justify-center">
        <Card className="p-12 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Product</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Card>
      </div>
    );
  }

  if (!currentCompanyProduct) {
    return (
      <div className="flex-1 p-4 lg:p-8 min-h-screen flex items-center justify-center">
        <Card className="p-12 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Product Not Found</h3>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Card>
      </div>
    );
  }

  const imageUrl = currentCompanyProduct.imageUrl 
    ? (currentCompanyProduct.imageUrl.startsWith('http') ? currentCompanyProduct.imageUrl : formatAvatarUrl(currentCompanyProduct.imageUrl))
    : undefined;

  // Use fetched variants if available, otherwise fallback to variants from company product
  const productVariants = variants.length > 0 ? variants : ((currentCompanyProduct as any)?.variants || []);

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onBack}
            className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{currentCompanyProduct.name || 'Unknown Product'}</h1>
            <p className="text-muted-foreground">{currentCompanyProduct.sku ? `SKU: ${currentCompanyProduct.sku}` : 'Company Product'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={formData.isAvailableForPurchase ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
            {formData.isAvailableForPurchase ? "Active" : "Inactive"}
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <Package className="w-3 h-3 mr-1" />
            Company Product
          </Badge>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="accent" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} variant="accent" size="sm" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attributes">Product Attributes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Product Image and Information */}
        <div className="space-y-6">
          {/* Product Image */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <div className="aspect-square rounded-lg overflow-hidden">
              <ImageWithFallback 
                src={imageUrl}
                alt={currentCompanyProduct.name || 'Product'}
                className="w-full h-full object-cover"
                fallbackSrc="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop"
              />
            </div>
          </Card>

          {/* Product Information */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <h3 className="font-semibold text-foreground mb-4">Product Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-foreground mt-1">{currentCompanyProduct.description || 'No description available'}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCompanyProduct.sku && (
                  <div>
                    <Label className="text-muted-foreground">SKU</Label>
                    <p className="text-foreground">{currentCompanyProduct.sku}</p>
                  </div>
                )}
                {/* Removed brand field display */}
              </div>

              {isEditing && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sellPrice">Sell Price</Label>
                        <Input
                          id="sellPrice"
                          type="number"
                          step="0.01"
                          value={formData.sellPrice || ''}
                          onChange={(e) => handleChange('sellPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                          min={0}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="type">Product Type</Label>
                      <Select value={formData.type} onValueChange={(value: 'sell' | 'service' | 'both') => handleChange('type', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sell">Sell Only</SelectItem>
                          <SelectItem value="service">Service Use</SelectItem>
                          <SelectItem value="both">Sell & Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="isAvailableForPurchase">Availability</Label>
                      <Select 
                        value={formData.isAvailableForPurchase ? 'true' : 'false'} 
                        onValueChange={(value) => handleChange('isAvailableForPurchase', value === 'true')}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Available for Purchase</SelectItem>
                          <SelectItem value="false">Not Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Add any additional notes about this product..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Tags - Inherited from System Product (Read-only) */}
          {currentCompanyProduct.tags && currentCompanyProduct.tags.length > 0 && (
            <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
              <h3 className="font-semibold text-foreground mb-4">Tags</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Tags are inherited from the system product.
              </p>
              <div className="flex flex-wrap gap-2">
                {currentCompanyProduct.tags.map((tag, index) => {
                  const tagObj = typeof tag === 'string' 
                    ? { id: index.toString(), name: tag, color: '#3B82F6' }
                    : tag;
                  return (
                    <Badge 
                      key={tagObj.id || index} 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${tagObj.color}20`, 
                        color: tagObj.color,
                        borderColor: `${tagObj.color}40`
                      }}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tagObj.name}
                    </Badge>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Notes */}
          {formData.notes && !isEditing && (
            <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
              <h3 className="font-semibold text-foreground mb-4">Notes</h3>
              <p className="text-muted-foreground">{formData.notes}</p>
            </Card>
          )}
        </div>

        {/* Right Side - Product Variants */}
        <div className="space-y-6">
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">Product Variants</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {productVariants?.length || 0} variant{(productVariants?.length || 0) !== 1 ? 's' : ''}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={handleAddVariant}
                    className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)]"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Variant
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Note: Pricing and stock are managed in the Stock Details page</p>
            </div>

            {variantsLoading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto" />
              </div>
            ) : productVariants && productVariants.length > 0 ? (
              <div className="space-y-4">
                {productVariants.map((variant) => (
                  <Card 
                    key={variant.id} 
                    className={`p-4 transition-all duration-200 hover:shadow-md ${
                      selectedVariant?.id === variant.id 
                        ? 'ring-2 ring-[var(--accent-primary)] bg-[var(--accent-bg)] border-[var(--accent-primary)]/30' 
                        : variant.isDefault
                        ? 'border-0 border-2 border-[var(--accent-primary)]'
                        : 'border bg-card hover:bg-accent/50'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground leading-tight">{variant.name}</h4>
                            {variant.isDefault && (
                              <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
                                Default
                              </Badge>
                            )}
                            <Badge className={variant.isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                              {variant.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          {variant.sku && (
                            <p className="text-xs text-muted-foreground mb-2">SKU: {variant.sku}</p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-accent text-muted-foreground hover:text-foreground ml-2">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-popover border-border" align="end">
                            {!variant.isDefault && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSetAsDefault(variant); }} className="text-popover-foreground hover:bg-sidebar-accent">
                                <Star className="w-4 h-4 mr-2" />
                                Set as Default
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewStockDetails(variant); }} className="text-popover-foreground hover:bg-sidebar-accent">
                              <Warehouse className="w-4 h-4 mr-2" />
                              Stock Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewVariant(variant); }} className="text-popover-foreground hover:bg-sidebar-accent">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditVariant(variant); }} className="text-popover-foreground hover:bg-sidebar-accent">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteClick(variant); }} className="text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Stock Information */}
                      <div className="pt-2">
                        {/* Active Stock Amount */}
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <span className="text-muted-foreground">Active Stock:</span>
                          <span className="text-[var(--accent-primary)] font-semibold">{variant.activeStock?.quantity || 0}</span>
                        </div>
                        
                        {/* Stock Progress Bar */}
                        {variant.maxStock !== undefined && variant.maxStock > 0 && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>
                                Stock: {variant.activeStock?.quantity || 0} / {variant.maxStock}
                              </span>
                              <span>
                                {Math.round(((variant.activeStock?.quantity || 0) / variant.maxStock) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  (variant.activeStock?.quantity || 0) < (variant.minStock || 0)
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ 
                                  width: `${Math.min(((variant.activeStock?.quantity || 0) / variant.maxStock) * 100, 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Min/Max Stock Information */}
                        {(variant.minStock !== undefined || variant.maxStock !== undefined) && (
                          <div className="flex items-center gap-4 text-sm">
                            {variant.minStock !== undefined && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Min Stock:</span>
                                <span className="text-foreground font-medium">{variant.minStock}</span>
                              </div>
                            )}
                            {variant.maxStock !== undefined && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Max Stock:</span>
                                <span className="text-foreground font-medium">{variant.maxStock}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium text-foreground mb-2">No Variants Available</h4>
                <p className="text-muted-foreground text-sm">This product doesn't have any variants configured.</p>
              </div>
            )}


            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              onConfirm={() => {
                if (variantToDelete) {
                  handleRemoveVariant(variantToDelete.id);
                }
              }}
              itemType="Variant"
              itemName={variantToDelete?.name}
              description={`Are you sure you want to delete "${variantToDelete?.name}"? This action cannot be undone.`}
            />

            {/* Variant Dialog */}
            <VariantDialog
              open={variantDialogOpen}
              onOpenChange={setVariantDialogOpen}
              mode={variantDialogMode}
              variant={variantDialogVariant}
              systemProductId={currentCompanyProduct?.systemProductId || null}
              onSave={handleSaveVariant}
              onCancel={() => {
                setVariantDialogVariant(null);
              }}
            />
          </Card>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="attributes" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">System Product Attributes</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  All available system product attributes
                </p>
              </div>
            </div>

            {attributesLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">Loading attributes...</div>
              </div>
            ) : systemAttributes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemAttributes.map((attr) => {
                  const unit = attr.unitOfMeasure 
                    ? unitsOfMeasure.find(u => u.id === attr.unitOfMeasure)
                    : null;

                  return (
                    <Card key={attr.id} className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{attr.name}</h4>
                          </div>
                          {attr.description && (
                            <p className="text-sm text-muted-foreground mb-3">{attr.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{attr.valueDataType}</Badge>
                            {unit && (
                              <Badge variant="outline" className="text-xs">
                                {unit.symbol}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium text-foreground mb-2">No Attributes Available</h4>
                <p className="text-muted-foreground text-sm">
                  No system product attributes are available.
                </p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
