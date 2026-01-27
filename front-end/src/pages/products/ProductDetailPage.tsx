import { useState, useEffect } from "react";
import { ArrowLeft, Package, Tag, Plus, Trash2, MoreVertical, Star, Edit, Settings } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Input } from "../../components/ui/input";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { useIsMobile } from "../../components/ui/use-mobile";
import { database } from "../../services";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchSystemProductRequest, clearError as clearSystemProductsError } from "../../store/slices/systemProductsSlice";
import { Product } from "../../services/products";
import { formatAvatarUrl } from "../../utils";
import { toast } from "sonner";
import { productVariantsService, ProductVariant as SystemProductVariant } from "../../services/productVariants";
import { VariantForm } from "../../components/products/VariantForm";
import { VariantDialog } from "../../components/products/VariantDialog";
import { VariantFormData } from "../../schemas/variantValidation";
import { generateVariantSKU } from "../../utils/skuGenerator";
import { CompanyProductVariant } from "../../services/companyProductVariants";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { UserRole, isRole } from "../../types/user";
import { CheckCircle2, XCircle } from "lucide-react";
import { DateTime } from "../../components/common/DateTime";

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
  variants?: ProductVariant[];
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
  variants?: ProductVariant[];
}

// Get company products from ProductsPage data
const getCompanyProductById = (id: string): CompanyProduct | null => {
  // This should match the exact same data from ProductsPage
  const companyProducts: CompanyProduct[] = [
    {
      id: "1",
      name: "Disposable Medical Gloves",
      description: "High-quality nitrile examination gloves for medical procedures",
      sku: "MED-GLV-001",
      type: "service",
      price: { cost: 0.15 },
      stock: { current: 5000, minimum: 1000, unit: "pieces" },
      supplier: {
        name: "MedSupply Co.",
        contact: "supplier@medsupply.com",
        avatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"
      },
      status: "Active",
      popularity: "High",
      usage: { thisMonth: 1200, trend: "up" },
      addedBy: "system",
      image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=300&h=200&fit=crop",
      tags: ["Medical", "Disposable", "PPE"],
      lastRestocked: "2024-09-20",
      isAvailableForPurchase: false,
      usedInServices: ["checkup", "dental-cleaning"]
    },
    {
      id: "2",
      name: "Premium Dental Cleaning Kit",
      description: "Complete dental hygiene kit with ultrasonic cleaner and accessories",
      sku: "DNT-CLN-002",
      type: "both",
      price: { cost: 450, sell: 120 },
      stock: { current: 25, minimum: 5, unit: "kits" },
      supplier: {
        name: "DentalTech Solutions",
        contact: "orders@dentaltech.com",
        avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop"
      },
      status: "Active",
      popularity: "High",
      usage: { thisMonth: 45, trend: "stable" },
      addedBy: "system",
      image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=300&h=200&fit=crop",
      tags: ["Dental", "Equipment", "Professional"],
      lastRestocked: "2024-09-15",
      isAvailableForPurchase: true,
      usedInServices: ["dental-cleaning", "dental-checkup"]
    },
    {
      id: "3",
      name: "Physical Therapy Resistance Bands",
      description: "Set of professional resistance bands for physical therapy and rehabilitation",
      sku: "PT-RES-003",
      type: "both",
      price: { cost: 25, sell: 65 },
      stock: { current: 8, minimum: 20, unit: "sets" },
      supplier: {
        name: "TherapyPro Equipment",
        contact: "support@therapypro.com",
        avatar: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=100&h=100&fit=crop"
      },
      status: "Low Stock",
      popularity: "Medium",
      usage: { thisMonth: 15, trend: "down" },
      addedBy: "system",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
      tags: ["Therapy", "Equipment", "Rehabilitation"],
      lastRestocked: "2024-08-30",
      isAvailableForPurchase: true,
      usedInServices: ["physiotherapy", "rehabilitation"],
      variants: [
        {
          id: "var-3-1",
          name: "Light Resistance Band",
          description: "Light resistance for beginners and gentle rehabilitation",
          sku: "PT-RES-003-LGT",
          isActive: true,
          color: "Yellow",
          size: "1.5m",
          weight: "150g",
          material: "Natural latex"
        },
        {
          id: "var-3-2",
          name: "Medium Resistance Band",
          description: "Medium resistance for intermediate therapy sessions",
          sku: "PT-RES-003-MED",
          isActive: true,
          color: "Green",
          size: "1.5m",
          weight: "200g",
          material: "Natural latex"
        },
        {
          id: "var-3-3",
          name: "Heavy Resistance Band",
          description: "High resistance for advanced strength training",
          sku: "PT-RES-003-HVY",
          isActive: true,
          color: "Red",
          size: "1.5m",
          weight: "250g",
          material: "Natural latex"
        }
      ]
    },
    {
      id: "4",
      name: "Premium Massage Oil Set",
      description: "Collection of therapeutic massage oils for spa treatments",
      sku: "SPA-OIL-005",
      type: "both",
      price: { cost: 35, sell: 89 },
      stock: { current: 15, minimum: 10, unit: "sets" },
      supplier: {
        name: "Wellness Essentials",
        contact: "sales@wellnessessentials.com",
        avatar: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop"
      },
      status: "Active",
      popularity: "Medium",
      usage: { thisMonth: 22, trend: "up" },
      addedBy: "company",
      companyId: "comp-1",
      image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=300&h=200&fit=crop",
      tags: ["Spa", "Massage", "Therapeutic"],
      lastRestocked: "2024-09-10",
      isAvailableForPurchase: true,
      usedInServices: ["massage-therapy", "aromatherapy"],
      variants: [
        {
          id: "var-4-1",
          name: "Lavender Massage Oil",
          description: "Relaxing lavender scented massage oil",
          sku: "SPA-OIL-005-LAV",
          isActive: true,
          color: "Purple",
          size: "250ml",
          weight: "260g",
          material: "Essential oil blend"
        },
        {
          id: "var-4-2",
          name: "Eucalyptus Massage Oil",
          description: "Invigorating eucalyptus massage oil for muscle relief",
          sku: "SPA-OIL-005-EUC",
          isActive: true,
          color: "Clear",
          size: "250ml",
          weight: "265g",
          material: "Essential oil blend"
        }
      ]
    }
  ];
  
  return companyProducts.find(product => product.id === id) || null;
};

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
    tags: product.tags || [],
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
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editingVariant, setEditingVariant] = useState<VariantFormData | null>(null);
  const [newVariant, setNewVariant] = useState<VariantFormData>({
    name: '',
    sku: '',
    color: '',
    size: '',
    sizeUnit: 'ml',
    weight: '',
    weightUnit: 'g',
    material: '',
    isDefault: false
  });
  
  // Variant dialog state
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [variantDialogMode, setVariantDialogMode] = useState<'add' | 'edit' | 'view'>('add');
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
            setSelectedVariant(variants[0]);
          }
        } catch (error) {
          console.error("Error fetching system product variants:", error);
          setSystemVariants([]);
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

  // Variant management functions for system products
  const handleAddSystemVariant = async () => {
    if (!productId || !newVariant.name || !newVariant.sku) {
      toast.error("Variant name and SKU are required");
      return;
    }

    try {
      // Combine size and sizeUnit, weight and weightUnit
      const size = newVariant.size && newVariant.sizeUnit 
        ? `${newVariant.size}${newVariant.sizeUnit}` 
        : newVariant.size || undefined;
      const weight = newVariant.weight && newVariant.weightUnit 
        ? `${newVariant.weight}${newVariant.weightUnit}` 
        : newVariant.weight || undefined;

      const variantData = {
        productId: productId,
        name: newVariant.name,
        sku: newVariant.sku,
        color: newVariant.color || undefined,
        size: size,
        weight: weight,
        material: newVariant.material || undefined,
        isDefault: newVariant.isDefault || false,
        isActive: true
      };

      await productVariantsService.createVariant(variantData);
      toast.success("Variant added successfully");
      
      // Refresh variants list
      const variants = await productVariantsService.getVariantsByProductId(productId);
      setSystemVariants(variants);
      
      // Reset form
      setNewVariant({
        name: '',
        sku: '',
        color: '',
        size: '',
        sizeUnit: 'ml',
        weight: '',
        weightUnit: 'g',
        material: '',
        isDefault: false
      });
      setIsAddingVariant(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add variant");
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
      
      if (selectedVariant?.id === variantId) {
        setSelectedVariant(null);
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

  // Helper function to convert SystemProductVariant to CompanyProductVariant format
  const convertSystemVariantToCompanyVariant = (variant: SystemProductVariant): CompanyProductVariant => {
    return {
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      color: variant.color || undefined,
      size: variant.size || undefined,
      weight: variant.weight || undefined,
      material: variant.material || undefined,
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

  const handleViewVariant = (variant: SystemProductVariant) => {
    const companyVariant = convertSystemVariantToCompanyVariant(variant);
    setVariantDialogVariant(companyVariant);
    setVariantDialogMode('view');
    setVariantDialogOpen(true);
  };

  const handleAddVariant = () => {
    setVariantDialogVariant(null);
    setVariantDialogMode('add');
    setVariantDialogOpen(true);
  };

  // Handle save variant from dialog
  const handleSaveVariant = async (variantData: VariantFormData) => {
    if (!variantData.name || !variantData.sku) {
      toast.error("Variant name and SKU are required");
      return;
    }

    try {
      // Combine size and sizeUnit, weight and weightUnit
      const size = variantData.size && variantData.sizeUnit 
        ? `${variantData.size}${variantData.sizeUnit}` 
        : variantData.size || undefined;
      const weight = variantData.weight && variantData.weightUnit 
        ? `${variantData.weight}${variantData.weightUnit}` 
        : variantData.weight || undefined;

      const updateData = {
        name: variantData.name,
        sku: variantData.sku,
        color: variantData.color || undefined,
        size: size,
        weight: weight,
        material: variantData.material || undefined,
        isDefault: variantData.isDefault || false
      };

      if (variantDialogMode === 'add') {
        // Create new variant
        await productVariantsService.createVariant(productId, updateData);
        toast.success("Variant created successfully");
      } else if (variantDialogMode === 'edit' && variantDialogVariant?.id) {
        // Update existing variant
        await productVariantsService.updateVariant(variantDialogVariant.id, updateData);
        toast.success("Variant updated successfully");
      }
      
      // Refresh variants list
      const variants = await productVariantsService.getVariantsByProductId(productId);
      setSystemVariants(variants);
      
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
    } catch (error: any) {
      toast.error(error.message || "Failed to set default variant");
    }
  };

  const handleCancelEdit = () => {
    setEditingVariantId(null);
    setEditingVariant(null);
  };

  const handleToggleProductVerification = async () => {
    if (!currentSystemProduct) return;
    
    try {
      const { productsService } = await import("../../services/products");
      await productsService.updateProduct(currentSystemProduct.id, {
        isVerified: !currentSystemProduct.isVerified
      });
      toast.success(`Product ${!currentSystemProduct.isVerified ? 'verified' : 'unverified'}`);
      
      // Refresh product
      dispatch(fetchSystemProductRequest(productId));
    } catch (error: any) {
      toast.error(error.message || "Failed to update product verification");
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
          description: '',
          sku: '',
          color: '',
          size: '',
          weight: '',
          material: '',
          notes: ''
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

  const handleUpdateVariant = async (variantId: string, updates: Partial<ProductVariant>) => {
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
      <div className="flex-1 p-4 lg:p-8 min-h-screen">
        <div className="text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested product could not be found.</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 p-4 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground">Loading product...</p>
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

  const imageUrl = (product as any).imageUrl || (product as any).image;
  const displayImageUrl = imageUrl 
    ? (imageUrl.startsWith('http') ? imageUrl : formatAvatarUrl(imageUrl))
    : undefined;

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
            <h1 className="text-2xl font-semibold text-foreground">{product.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {productType === "system" && currentSystemProduct && (
            <Badge className={currentSystemProduct.isVerified ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30" : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30"}>
              {currentSystemProduct.isVerified ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" /> Pending
                </>
              )}
            </Badge>
          )}
          <Badge className={(product as any).isActive || (product as any).status === "Active" ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
            {(product as any).isActive || (product as any).status === "Active" ? "Active" : "Inactive"}
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <Package className="w-3 h-3 mr-1" />
            {productType === "company" ? "Company Product" : "System Product"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Product Image and Information */}
        <div className="space-y-6">
          {/* Product Image */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <div className="aspect-square rounded-lg overflow-hidden">
              <ImageWithFallback 
                src={displayImageUrl}
                alt={product.name}
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
                <p className="text-foreground mt-1">{product.description}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(product as any).usageCount !== undefined && (
                  <div>
                    <Label className="text-muted-foreground">Used by</Label>
                    <p className="text-foreground">{(product as any).usageCount} companies</p>
                  </div>
                )}
                {(product as any).stock && (
                  <div>
                    <Label className="text-muted-foreground">Stock</Label>
                    <p className="text-foreground">{(product as any).stock.current} {(product as any).stock.unit}</p>
                  </div>
                )}
                {(product as any).createdDate && (
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="text-foreground">
                      <DateTime date={(product as any).createdDate} />
                    </p>
                  </div>
                )}
                {(product as any).lastModified && (
                  <div>
                    <Label className="text-muted-foreground">Last Modified</Label>
                    <p className="text-foreground">
                      <DateTime date={(product as any).lastModified} />
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
              <h3 className="font-semibold text-foreground mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => {
                  // Handle both string tags (legacy) and Tag objects
                  const tagObj = typeof tag === 'string' 
                    ? { id: index.toString(), name: tag, color: '#3B82F6', icon: undefined }
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
          {(product as any).notes && (
            <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
              <h3 className="font-semibold text-foreground mb-4">Notes</h3>
              <p className="text-muted-foreground">{(product as any).notes}</p>
            </Card>
          )}
        </div>

        {/* Right Side - Product Variants */}
        <div className="space-y-6">
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground">Product Variants</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {productType === "system" 
                    ? `${systemVariants.length} variant${systemVariants.length !== 1 ? 's' : ''}`
                    : `${product.variants?.length || 0} variant${(product.variants?.length || 0) !== 1 ? 's' : ''}`
                  }
                </Badge>
                {productType === "system" && (
                  <Button
                    size="sm"
                    onClick={handleAddVariant}
                    className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)]"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Variant
                  </Button>
                )}
                {productType === "company" && (
                  <Button
                    size="sm"
                    onClick={() => setIsAddingVariant(true)}
                    className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)]"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Variant
                  </Button>
                )}
              </div>
            </div>

            {/* System Product Variants */}
            {productType === "system" ? (
              variantsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse">Loading variants...</div>
                </div>
              ) : systemVariants.length > 0 ? (
                <div className="space-y-4">
                  {systemVariants.map((variant) => (
                    <Card 
                      key={variant.id} 
                      className={`p-4 border transition-all duration-200 hover:shadow-md ${
                        variant.isDefault 
                          ? 'ring-2 ring-blue-500/50 bg-blue-500/5' 
                          : selectedVariant?.id === variant.id 
                            ? 'ring-2 ring-[var(--accent-primary)] bg-[var(--accent-bg)]' 
                            : 'bg-card hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedVariant(selectedVariant?.id === variant.id ? null : variant)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-foreground leading-tight">{variant.name}</h4>
                              {variant.isDefault && (
                                <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs">
                                  <Star className="w-3 h-3 mr-1 fill-current" /> Default
                                </Badge>
                              )}
                              <Badge className={variant.isVerified ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30" : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30"}>
                                {variant.isVerified ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3 mr-1" /> Pending
                                  </>
                                )}
                              </Badge>
                              <Badge className={variant.isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                                {variant.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            {variant.sku && (
                              <p className="text-xs text-muted-foreground mb-2">SKU: {variant.sku}</p>
                            )}
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {variant.color && <span>Color: {variant.color}</span>}
                              {variant.size && <span>Size: {variant.size}</span>}
                              {variant.weight && <span>Weight: {variant.weight}</span>}
                              {variant.material && <span>Material: {variant.material}</span>}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleEditVariant(variant);
                              }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {!variant.isDefault && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetDefaultVariant(variant);
                                }}>
                                  <Star className="w-4 h-4 mr-2" />
                                  Set as Default
                                </DropdownMenuItem>
                              )}
                              {isSuperAdmin && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleVariantVerification(variant);
                                }}>
                                  {variant.isVerified ? (
                                    <>
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Unverify
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Verify
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleToggleVariantStatus(variant);
                              }}>
                                <Settings className="w-4 h-4 mr-2" />
                                {variant.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSystemVariant(variant.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
              )
            ) : product.variants && product.variants.length > 0 ? (
              <div className="space-y-4">
                {product.variants.map((variant) => (
                  <Card 
                    key={variant.id} 
                    className={`p-4 border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedVariant?.id === variant.id 
                        ? 'ring-2 ring-[var(--accent-primary)] bg-[var(--accent-bg)]' 
                        : 'bg-card hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedVariant(selectedVariant?.id === variant.id ? null : variant)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-foreground leading-tight">{variant.name}</h4>
                        <Badge className={variant.isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                          {variant.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{variant.description}</p>
                      {variant.sku && (
                        <p className="text-xs text-muted-foreground">SKU: {variant.sku}</p>
                      )}
                    </div>

                    {/* Variant Details - Show when selected */}
                    {selectedVariant?.id === variant.id && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <h5 className="font-medium text-foreground mb-3">Variant Details</h5>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {variant.color && (
                            <div>
                              <span className="text-muted-foreground">Color:</span>
                              <span className="text-foreground ml-2">{variant.color}</span>
                            </div>
                          )}
                          {variant.size && (
                            <div>
                              <span className="text-muted-foreground">Size:</span>
                              <span className="text-foreground ml-2">{variant.size}</span>
                            </div>
                          )}
                          {variant.weight && (
                            <div>
                              <span className="text-muted-foreground">Weight:</span>
                              <span className="text-foreground ml-2">{variant.weight}</span>
                            </div>
                          )}
                          {variant.material && (
                            <div>
                              <span className="text-muted-foreground">Material:</span>
                              <span className="text-foreground ml-2">{variant.material}</span>
                            </div>
                          )}
                          {variant.dimensions && (
                            <div>
                              <span className="text-muted-foreground">Dimensions:</span>
                              <span className="text-foreground ml-2">{variant.dimensions}</span>
                            </div>
                          )}
                        </div>
                        {variant.notes && (
                          <div className="mt-3">
                            <span className="text-muted-foreground text-sm">Notes:</span>
                            <p className="text-foreground text-sm mt-1">{variant.notes}</p>
                          </div>
                        )}
                        
                        {/* Variant Management Buttons - Only for company owners */}
                        {productType === "company" && (
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateVariant(variant.id, { isActive: !variant.isActive });
                              }}
                              className="flex-1"
                            >
                              {variant.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to remove this variant?')) {
                                  handleRemoveVariant(variant.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
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

            {/* Variant Dialog for Add/Edit/View */}
            {productType === "system" && (
              <VariantDialog
                open={variantDialogOpen}
                onOpenChange={setVariantDialogOpen}
                mode={variantDialogMode}
                variant={variantDialogVariant}
                systemProductId={null} // System products don't have a parent system product
                variantMode="system"
                onSave={handleSaveVariant}
                onCancel={() => {
                  setVariantDialogVariant(null);
                }}
              />
            )}

            {/* Add Variant Form - Only for company owners */}
            {productType === "company" && isAddingVariant && (
              <div className="mt-6 p-4 border border-[var(--glass-border)] rounded-lg bg-[var(--glass-bg)]">
                <h4 className="font-medium text-foreground mb-4">Add New Variant</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Variant Name *</Label>
                      <input
                        type="text"
                        value={newVariant.name}
                        onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground"
                        placeholder="e.g., Premium Hair Shampoo - Dry Hair"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">SKU *</Label>
                      <input
                        type="text"
                        value={newVariant.sku}
                        onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground"
                        placeholder="e.g., BEA-SHP001-DRY"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <textarea
                      value={newVariant.description}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground"
                      rows={3}
                      placeholder="Describe this variant..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Color</Label>
                      <input
                        type="text"
                        value={newVariant.color}
                        onChange={(e) => setNewVariant(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground"
                        placeholder="e.g., Golden"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Size</Label>
                      <input
                        type="text"
                        value={newVariant.size}
                        onChange={(e) => setNewVariant(prev => ({ ...prev, size: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground"
                        placeholder="e.g., 500ml"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Weight</Label>
                      <input
                        type="text"
                        value={newVariant.weight}
                        onChange={(e) => setNewVariant(prev => ({ ...prev, weight: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground"
                        placeholder="e.g., 520g"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Material</Label>
                      <input
                        type="text"
                        value={newVariant.material}
                        onChange={(e) => setNewVariant(prev => ({ ...prev, material: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground"
                        placeholder="e.g., Argan oil enriched"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Notes</Label>
                    <textarea
                      value={newVariant.notes}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground"
                      rows={2}
                      placeholder="Additional notes about this variant..."
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={handleAddCompanyVariant}
                      disabled={!newVariant.name || !newVariant.sku}
                      className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)]"
                    >
                      Add Variant
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingVariant(false);
                        setNewVariant({
                          name: '',
                          description: '',
                          sku: '',
                          color: '',
                          size: '',
                          weight: '',
                          material: '',
                          notes: ''
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}