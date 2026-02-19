import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchSystemProductRequest, clearError as clearSystemProductsError } from "../../../store/slices/systemProductsSlice";
import { Product } from "../../../services/products";
import { toast } from "sonner";
import { productVariantsService, ProductVariant as SystemProductVariant } from "../../../services/productVariants";
import { VariantFormData } from "../../../schemas/variantValidation";
import { CompanyProductVariant } from "../../../services/companyProductVariants";
import { UserRole, isRole } from "../../../types/user";
import { database } from "../../../services";
import { ProductDetailHeader } from "./ProductDetailHeader";
import { ProductOverviewTab } from "./overview/ProductOverviewTab";
import { ProductVariantsTab } from "./productVariants/ProductVariantsTab";
import { ProductAttributesTab } from "./attributes/ProductAttributesTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";

// Legacy ProductVariant interface for company products (kept for backward compatibility)
interface LegacyProductVariant {
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

interface SystemProduct {
  id: string;
  name: string;
  description: string;
  sku?: string;
  imageUrl: string;
  isActive: boolean;
  usageCount: number;
  createdDate: string;
  lastModified: string;
  tags: string[];
  variants?: LegacyProductVariant[];
}

interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
  productType?: "system" | "company"; // Determine which type of product to load
  currentUser?: {
    id: string;
    role: string | number | UserRole;
    [key: string]: any;
  };
}

// Company Product interface to match ProductsPage data
interface CompanyProduct {
  id: string;
  name: string;
  description: string;
  sku: string;
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
  companyId?: string;
  image: string;
  tags: string[];
  lastRestocked: string;
  isAvailableForPurchase?: boolean;
  usedInServices?: string[];
  variants?: LegacyProductVariant[];
}

// Helper function to map Product from API to SystemProduct for UI
const mapProductToSystemProduct = (product: Product): SystemProduct => {
  return {
    id: String(product.id),
    name: product.name,
    description: product.description || "",
    imageUrl: product.imageUrl || "",
    isActive: product.isActive,
    usageCount: product.usageCount || 0,
    createdDate: product.createdDate,
    lastModified: product.lastModified,
    tags: (product.tags || []) as string[],
    variants: [] // Variants will be loaded separately if needed
  };
};

export function ProductDetailPage({ productId, onBack, productType = "system", currentUser }: ProductDetailPageProps) {
  const dispatch = useAppDispatch();
  const { currentSystemProduct, loading: productsLoading, error: productsError } = useAppSelector((state) => state.systemProducts);
  const isSuperAdmin = isRole(currentUser?.role, UserRole.SYSTEM_ADMIN);
  
  const [product, setProduct] = useState<SystemProduct | CompanyProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<LegacyProductVariant | SystemProductVariant | null>(null);
  const [systemVariants, setSystemVariants] = useState<SystemProductVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [newVariant, setNewVariant] = useState<VariantFormData>({
    name: '',
    sku: '',
    type: 'sell',
    isDefault: false,
    variantDefiningAttributes: [],
    variantAttributeValues: {}
  });
  
  // Variant dialog state
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [variantDialogMode, setVariantDialogMode] = useState<'add' | 'edit'>('add');
  const [variantDialogVariant, setVariantDialogVariant] = useState<CompanyProductVariant | null>(null);

  // Fetch system product when productId changes
  useEffect(() => {
    if (productType === "system" && productId) {
      dispatch(fetchSystemProductRequest(productId));
    }
  }, [productId, productType, dispatch]);

  // Fetch system product variants
  useEffect(() => {
    if (productType === "system" && productId) {
      const fetchVariants = async () => {
        setVariantsLoading(true);
        try {
          const variants = await productVariantsService.getVariantsByProductId(productId);
          setSystemVariants(variants);
          if (variants.length > 0) {
            // Prefer default variant, otherwise select first variant
            const defaultVariant = variants.find(v => v.isDefault);
            setSelectedVariant(defaultVariant || variants[0]);
          } else {
            setSelectedVariant(null);
          }
        } catch (error) {
          console.error("Error fetching system product variants:", error);
          setSystemVariants([]);
          setSelectedVariant(null);
        } finally {
          setVariantsLoading(false);
        }
      };
      fetchVariants();
    }
  }, [productId, productType]);

  // Map product from Redux to SystemProduct format
  useEffect(() => {
    if (productType === "system") {
      if (currentSystemProduct) {
        const mappedProduct = mapProductToSystemProduct(currentSystemProduct);
        setProduct(mappedProduct);
      }
    } else {
      // For company products, use existing logic
      const fetchCompanyProduct = async () => {
        try {
          const productData = await database.products.getCompanyProductById(productId);
          setProduct(productData);
          if (productData?.variants && productData.variants.length > 0) {
            setSelectedVariant(productData.variants[0]);
          }
        } catch (error) {
          console.error("Error fetching company product:", error);
        }
      };
      fetchCompanyProduct();
    }
  }, [currentSystemProduct, productType, productId]);

  // Handle errors
  useEffect(() => {
    if (productsError) {
      toast.error(productsError);
      dispatch(clearSystemProductsError());
    }
  }, [productsError, dispatch]);

  const loading = productType === "system" ? productsLoading : false;

  // Helper function to convert SystemProductVariant to CompanyProductVariant format
  const convertSystemVariantToCompanyVariant = (variant: SystemProductVariant): CompanyProductVariant => {
    return {
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      isDefault: variant.isDefault || false,
      isActive: variant.isActive !== undefined ? variant.isActive : true,
      systemProductVariantId: undefined // System variants don't have a parent system variant
    } as CompanyProductVariant;
  };

  const handleEditVariant = (variant: SystemProductVariant) => {
    const companyVariant = convertSystemVariantToCompanyVariant(variant);
    setVariantDialogVariant(companyVariant);
    setVariantDialogMode('edit');
    setVariantDialogOpen(true);
  };

  const handleAddVariant = () => {
    setVariantDialogVariant(null);
    setVariantDialogMode('add');
    setVariantDialogOpen(true);
  };

  // Handle save variant from dialog
  const handleSaveVariant = async (variantData: VariantFormData, attributeValues?: Record<string, string>) => {
    if (!variantData.name || !variantData.sku) {
      toast.error("Variant name and SKU are required");
      return;
    }

    try {
      // Extract variant defining attributes and their values
      const variantDefiningAttributeIds = (variantData as any).variantDefiningAttributes || [];

      const updateData = {
        name: variantData.name,
        sku: variantData.sku,
        isDefault: variantData.isDefault || false
      };

      let savedVariantId: string | null = null;

      if (variantDialogMode === 'add') {
        // Create new variant
        const newVariant = await productVariantsService.createVariant({
          productId,
          ...updateData
        });
        savedVariantId = newVariant.id;
        toast.success("Variant created successfully");
      } else if (variantDialogMode === 'edit' && variantDialogVariant?.id) {
        // Update existing variant
        await productVariantsService.updateVariant(variantDialogVariant.id, updateData);
        savedVariantId = variantDialogVariant.id;
        toast.success("Variant updated successfully");
      }

      // Save variant-defining attributes and attribute values
      if (savedVariantId) {
        try {
          const { productRelatedAttributesService } = await import("../../../services/productRelatedAttributes");
          const productAttributes = await productRelatedAttributesService.getAttributesByProductId(productId);
          
          // Update variant-defining status for all attributes
          for (const attr of productAttributes) {
            const shouldBeVariantDefining = variantDefiningAttributeIds.includes(attr.attributeId);
            if (attr.isVariantDefining !== shouldBeVariantDefining) {
              await productRelatedAttributesService.updateAttribute(attr.id, {
                isVariantDefining: shouldBeVariantDefining
              });
            }
          }

          // Save attribute values if provided
          if (attributeValues && Object.keys(attributeValues).length > 0) {
            // Prepare values for bulk upsert
            const valuesToSave = productAttributes
              .map((attr) => ({
                variantId: savedVariantId!,
                productRelatedAttributeId: attr.id,
                attributeValue: attributeValues[attr.id] || null,
              }))
              .filter((v) => v.attributeValue !== null && v.attributeValue !== "");

            if (valuesToSave.length > 0) {
              const { productRelatedAttributeValuesService } = await import("../../../services/productRelatedAttributeValues");
              await productRelatedAttributeValuesService.bulkUpsertValues(savedVariantId, valuesToSave);
            }
          }
        } catch (error: any) {
          console.error("Error saving attribute values:", error);
          toast.error("Variant saved but failed to save attribute values");
        }
      }
      
      // Refresh variants list
      const variants = await productVariantsService.getVariantsByProductId(productId);
      setSystemVariants(variants);
      
      // Update selected variant - prefer default, otherwise keep current or select first
      if (variants.length > 0) {
        const defaultVariant = variants.find(v => v.isDefault);
        if (defaultVariant) {
          setSelectedVariant(defaultVariant);
        } else if (!selectedVariant || !variants.find(v => v.id === selectedVariant.id)) {
          setSelectedVariant(variants[0]);
        }
      }
      
      // Close dialog
      setVariantDialogOpen(false);
      setVariantDialogVariant(null);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${variantDialogMode === 'add' ? 'create' : 'update'} variant`);
    }
  };

  const handleSetDefaultVariant = async (variant: SystemProductVariant) => {
    try {
      await productVariantsService.updateVariant(variant.id, {
        isDefault: true
      });
      toast.success("Default variant updated");
      
      // Refresh variants list
      const variants = await productVariantsService.getVariantsByProductId(productId);
      setSystemVariants(variants);
      
      // Select the new default variant
      const updatedDefaultVariant = variants.find(v => v.isDefault);
      if (updatedDefaultVariant) {
        setSelectedVariant(updatedDefaultVariant);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to set default variant");
    }
  };

  const handleDeleteSystemVariant = async (variantId: string) => {
    if (!confirm("Are you sure you want to delete this variant?")) {
      return;
    }

    try {
      await productVariantsService.deleteVariant(variantId);
      toast.success("Variant deleted successfully");
      
      // Refresh variants list
      const variants = await productVariantsService.getVariantsByProductId(productId);
      setSystemVariants(variants);
      
      // Update selected variant if the deleted one was selected
      if (selectedVariant?.id === variantId) {
        if (variants.length > 0) {
          const defaultVariant = variants.find(v => v.isDefault);
          setSelectedVariant(defaultVariant || variants[0]);
        } else {
          setSelectedVariant(null);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete variant");
    }
  };

  const handleToggleVariantStatus = async (variant: SystemProductVariant) => {
    try {
      await productVariantsService.updateVariant(variant.id, {
        isActive: !variant.isActive
      });
      toast.success(`Variant ${!variant.isActive ? 'activated' : 'deactivated'}`);
      
      // Refresh variants list
      const variants = await productVariantsService.getVariantsByProductId(productId);
      setSystemVariants(variants);
    } catch (error: any) {
      toast.error(error.message || "Failed to update variant");
    }
  };

  const handleToggleVariantVerification = async (variant: SystemProductVariant) => {
    try {
      await productVariantsService.updateVariant(variant.id, {
        isVerified: !variant.isVerified
      });
      toast.success(`Variant ${!variant.isVerified ? 'verified' : 'unverified'}`);
      
      // Refresh variants list
      const variants = await productVariantsService.getVariantsByProductId(productId);
      setSystemVariants(variants);
    } catch (error: any) {
      toast.error(error.message || "Failed to update variant verification");
    }
  };

  // Legacy variant management for company products
  const handleAddCompanyVariant = async () => {
    if (!product || !newVariant.name || !newVariant.sku) return;
    
    try {
      const isSystemProduct = productType === "system";
      const addedVariant = await database.products.addVariant(
        product.id, 
        newVariant, 
        isSystemProduct
      );
      
      if (addedVariant) {
        // Update the local product state
        setProduct(prev => ({
          ...prev!,
          variants: [...(prev!.variants || []), addedVariant]
        }));
        
        // Reset form
        setNewVariant({
          name: '',
          sku: '',
          type: 'sell',
          isDefault: false,
          variantDefiningAttributes: [],
          variantAttributeValues: {}
        });
        setIsAddingVariant(false);
      }
    } catch (error) {
      console.error('Error adding variant:', error);
    }
  };

  const handleRemoveVariant = async (variantId: string) => {
    if (!product) return;
    
    try {
      const isSystemProduct = productType === "system";
      const success = await database.products.removeVariant(
        product.id, 
        variantId, 
        isSystemProduct
      );
      
      if (success) {
        // Update the local product state
        setProduct(prev => ({
          ...prev!,
          variants: prev!.variants?.filter(v => v.id !== variantId) || []
        }));
        
        // Clear selected variant if it was removed
        if (selectedVariant?.id === variantId) {
          setSelectedVariant(null);
        }
      }
    } catch (error) {
      console.error('Error removing variant:', error);
    }
  };

  const handleUpdateVariant = async (variantId: string, updates: Partial<LegacyProductVariant>) => {
    if (!product) return;
    
    try {
      const isSystemProduct = productType === "system";
      const updatedVariant = await database.products.updateVariant(
        product.id, 
        variantId, 
        updates, 
        isSystemProduct
      );
      
      if (updatedVariant) {
        // Update the local product state
        setProduct(prev => ({
          ...prev!,
          variants: prev!.variants?.map(v => v.id === variantId ? updatedVariant : v) || []
        }));
        
        // Update selected variant if it was the one being updated
        if (selectedVariant?.id === variantId) {
          setSelectedVariant(updatedVariant);
        }
      }
    } catch (error) {
      console.error('Error updating variant:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 lg:p-8 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
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

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-8 min-h-screen">
      <ProductDetailHeader
        product={product}
        productType={productType}
        currentSystemProduct={currentSystemProduct}
        onBack={onBack}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="variants">Product Variants</TabsTrigger>
          <TabsTrigger value="attributes">Product Attributes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ProductOverviewTab 
            product={product}
            variants={productType === "system" ? systemVariants : []}
            variantsLoading={variantsLoading}
            selectedVariantId={selectedVariant?.id || null}
            onVariantSelect={productType === "system" ? (variant) => setSelectedVariant(variant as SystemProductVariant | null) : undefined}
          />
        </TabsContent>

        <TabsContent value="variants" className="mt-6">
          <ProductVariantsTab
            productType={productType}
            productId={productId}
            systemVariants={systemVariants}
            companyVariants={product.variants as LegacyProductVariant[]}
            variantsLoading={variantsLoading}
            selectedVariantId={selectedVariant?.id || null}
            isSuperAdmin={isSuperAdmin}
            isAddingVariant={isAddingVariant}
            newVariant={newVariant}
            variantDialogOpen={variantDialogOpen}
            variantDialogMode={variantDialogMode}
            variantDialogVariant={variantDialogVariant}
            onVariantSelect={(variant) => setSelectedVariant(variant as LegacyProductVariant | SystemProductVariant | null)}
            onAddVariant={productType === "system" ? handleAddVariant : () => setIsAddingVariant(true)}
            onEditVariant={productType === "system" ? (variant) => handleEditVariant(variant as SystemProductVariant) : undefined}
            onDeleteVariant={productType === "system" ? handleDeleteSystemVariant : handleRemoveVariant}
            onToggleVariantStatus={productType === "system" ? handleToggleVariantStatus : undefined}
            onToggleVariantVerification={productType === "system" ? handleToggleVariantVerification : undefined}
            onSetDefaultVariant={productType === "system" ? handleSetDefaultVariant : undefined}
            onUpdateVariant={productType === "company" ? handleUpdateVariant : undefined}
            onSaveVariant={handleSaveVariant}
            onSetIsAddingVariant={setIsAddingVariant}
            onSetNewVariant={setNewVariant}
            onSetVariantDialogOpen={setVariantDialogOpen}
            onSetVariantDialogMode={setVariantDialogMode}
            onSetVariantDialogVariant={setVariantDialogVariant}
            onAddCompanyVariant={productType === "company" ? handleAddCompanyVariant : undefined}
          />
        </TabsContent>

        <TabsContent value="attributes" className="mt-6">
          <ProductAttributesTab
            productId={productId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
