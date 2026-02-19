import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { 
  fetchCompanyProductRequest, 
  updateCompanyProductRequest,
  clearError as clearCompanyProductsError 
} from "../../../../store/slices/companyProductsSlice";
import { fetchSystemProductRequest } from "../../../../store/slices/systemProductsSlice";
import { CompanyProductVariant } from "../../../../services/companyProductVariants";
import { companyProductVariantsService } from "../../../../services/companyProductVariants";
import { toast } from "sonner";
import { VariantFormData } from "../../../../schemas/variantValidation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../components/ui/tabs";
import { CompanyProductDetailHeader } from "./CompanyProductDetailHeader";
import { CompanyProductOverviewTab } from "./overview/CompanyProductOverviewTab";
import { CompanyProductAttributesTab } from "./attributes/CompanyProductAttributesTab";
import { CompanyProductVariantsTab } from "./productVariants/CompanyProductVariantsTab";

interface CompanyProductDetailPageProps {
  productId: string;
  onBack: () => void;
}

export const CompanyProductDetailPage = ({ productId, onBack }: CompanyProductDetailPageProps) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<CompanyProductVariant | null>(null);
  
  // Redux state
  const { currentCompanyProduct, loading, error } = useAppSelector((state) => state.companyProducts);
  const [variants, setVariants] = useState<CompanyProductVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
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
        // Variants are loaded separately
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

  // Handle save
  const handleSave = () => {
    if (!currentCompanyProduct) return;

    const updateData = {
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
    } catch (error: any) {
      console.error('Error removing variant:', error);
      toast.error(error?.message || "Failed to remove variant");
    }
  };

  // Handle update variant
  const handleUpdateVariant = async (variantId: string, updates: any) => {
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

  // Handle view variant - handled by CompanyProductVariantList component

  // Handle view stock details
  const handleViewStockDetails = (variant: CompanyProductVariant) => {
    window.location.href = `/system/company-products/${productId}/variants/${variant.id}/stock`;
  };

  // Handle save variant from dialog
  const handleSaveVariant = async (variantData: VariantFormData) => {
    if (!currentCompanyProduct?.id) {
      toast.error("Product ID is missing");
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
      } else if (!currentCompanyProduct.systemProductId && variantData.name) {
        // For custom products, add variant name
        newVariantData.name = variantData.name;
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

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-8 min-h-screen">
      <CompanyProductDetailHeader
        product={currentCompanyProduct}
        isEditing={isEditing}
        loading={loading}
        isAvailableForPurchase={formData.isAvailableForPurchase}
        onBack={onBack}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="variants">Product Variants</TabsTrigger>
          <TabsTrigger value="attributes">Product Attributes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <CompanyProductOverviewTab
            product={currentCompanyProduct}
            variants={variants}
            variantsLoading={variantsLoading}
            selectedVariantId={selectedVariant?.id || null}
            onVariantSelect={setSelectedVariant}
            isEditing={isEditing}
            formData={{
              notes: formData.notes,
              isAvailableForPurchase: formData.isAvailableForPurchase,
            }}
            onFormChange={handleChange}
          />
        </TabsContent>

        <TabsContent value="variants" className="mt-6">
          <CompanyProductVariantsTab
            product={currentCompanyProduct}
            variants={variants}
            variantsLoading={variantsLoading}
            selectedVariantId={selectedVariant?.id || null}
            onVariantSelect={setSelectedVariant}
            onDeleteVariant={handleRemoveVariant}
            onSetAsDefault={handleSetAsDefault}
            onViewStockDetails={handleViewStockDetails}
            onSaveVariant={handleSaveVariant}
          />
        </TabsContent>

        <TabsContent value="attributes" className="mt-6">
          <CompanyProductAttributesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
