import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Package, Plus, Check, ChevronLeft, ChevronRight, Loader2, Tag as TagIcon, Trash2, MoreVertical } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchSystemProductsRequest } from "../../store/slices/systemProductsSlice";
import { createCompanyProductRequest, clearError as clearCompanyProductsError } from "../../store/slices/companyProductsSlice";
import { createCompanyProductVariantsRequest, clearError as clearVariantsError } from "../../store/slices/companyProductVariantsSlice";
import { fetchTagsRequest } from "../../store/slices/tagsSlice";
import { Product } from "../../services/products";
import { productsService } from "../../services/products";
import { formatAvatarUrl } from "../../utils";
import { companiesService } from "../../services/companies";
import { Tag } from "../../services/tags";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import FileUpload from "../../components/ui/file-upload";
import { TagSelector } from "../../components/tags/TagSelector";
import { VariantForm } from "../../components/products/VariantForm";
import { VariantFormData } from "../../schemas/variantValidation";
import { SystemProductVariantSelector } from "../../components/products/SystemProductVariantSelector";
import { ProductVariant as SystemProductVariant } from "../../services/productVariants";
import { generateVariantSKU } from "../../utils/skuGenerator";

interface ProductVariant {
  id?: string;
  systemProductVariantId?: string; // Reference to system product variant
  name: string;
  sku: string;
  color?: string;
  size?: string;
  sizeUnit?: 'ml' | 'L';
  weight?: string;
  weightUnit?: 'mg' | 'g' | 'kg';
  material?: string;
  type?: "sell" | "service" | "both";
  isActive?: boolean;
  isDefault?: boolean;
  // Pricing and stock for this variant
  price?: {
    cost: number;
    sell?: number;
  };
  stock?: {
    current: number;
    minimum: number;
    maximum: number;
    unit: string;
  };
}

interface SystemProduct {
  id: string;
  name: string;
  description: string;
  sku: string;
  type: "sell" | "service" | "both";
  image: string;
  tags: string[] | Tag[];
  supplier: {
    name: string;
    contact: string;
    avatar: string;
  };
  hasVariants?: boolean;
  variants?: ProductVariant[];
}

interface CompanyProduct {
  systemProductId?: string;
  selectedVariantId?: string;
  name: string;
  description: string;
  sku: string;
  // type, price, stock are now in variants
  isAvailableForPurchase: boolean;
  usedInServices: string[];
  image: string;
  tags: string[];
  notes?: string;
}

// Helper function to map Product from API to SystemProduct for dialog
const mapProductToSystemProduct = (product: Product): SystemProduct => {
  // Determine product type based on available data
  // Since the API Product doesn't have a "type" field, we'll default to "both"
  // You can adjust this logic based on your business rules
  const productType: "sell" | "service" | "both" = "both";
  
  // Handle image URL - check if it's already a full URL or needs formatting
  const imageUrl = product.imageUrl 
    ? (product.imageUrl.startsWith('http') ? product.imageUrl : formatAvatarUrl(product.imageUrl))
    : "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop";
  
  return {
    id: String(product.id),
    name: product.name,
    description: product.description || "",
    sku: product.sku || "",
    type: productType,
    image: imageUrl,
    tags: product.tags || [],
    supplier: {
      name: product.brand || "System Supplier",
      contact: "supplier@system.com",
      avatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"
    },
    hasVariants: false, // Variants can be added later if needed
    variants: []
  };
};

interface AddProductToCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded: (product: CompanyProduct) => void;
  existingProductSKUs?: string[];
  currentUser?: {
    email: string;
    role: string;
    name: string;
    companyId?: string;
  } | null;
}

export function AddProductToCompanyDialog({
  open,
  onOpenChange,
  onProductAdded,
  existingProductSKUs = [],
  currentUser
}: AddProductToCompanyDialogProps) {
  const dispatch = useAppDispatch();
  const { systemProducts: productsFromRedux, loading: productsLoading } = useAppSelector((state) => state.systemProducts);
  const { loading: companyProductsLoading, error: companyProductsError } = useAppSelector((state) => state.companyProducts);
  const { tags } = useAppSelector((state) => state.tags);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<SystemProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const [companyTags, setCompanyTags] = useState<Tag[]>([]);
  const [loadingCompanyTags, setLoadingCompanyTags] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [selectedVariantForPricing, setSelectedVariantForPricing] = useState<ProductVariant | null>(null);
  const [defaultVariantId, setDefaultVariantId] = useState<string | null>(null);
  const [showAddSystemProductDialog, setShowAddSystemProductDialog] = useState(false);
  const [newSystemProductData, setNewSystemProductData] = useState({
    brand: "",
    name: "",
    description: "",
    imageUrl: "",
    tagIds: [] as string[]
  });
  const [isCreatingSystemProduct, setIsCreatingSystemProduct] = useState(false);
  
  const totalSteps = 3;

  // Load system products and tags when dialog opens
  useEffect(() => {
    if (open) {
      dispatch(fetchSystemProductsRequest({ isActive: true }));
      dispatch(fetchTagsRequest({ active: true }));
    }
  }, [open, dispatch]);

  // Load company tags when dialog opens
  useEffect(() => {
    const fetchCompanyTags = async () => {
      if (open && currentUser?.companyId) {
        try {
          setLoadingCompanyTags(true);
          const company = await companiesService.getCompanyById(currentUser.companyId);
          setCompanyTags(company.tags || []);
        } catch (error) {
          console.error('Error fetching company tags:', error);
          setCompanyTags([]);
        } finally {
          setLoadingCompanyTags(false);
        }
      } else {
        setCompanyTags([]);
      }
    };

    fetchCompanyTags();
  }, [open, currentUser?.companyId]);

  // Handle company products errors
  useEffect(() => {
    if (companyProductsError) {
      toast.error(companyProductsError);
      dispatch(clearCompanyProductsError());
    }
  }, [companyProductsError, dispatch]);

  // Map products from Redux to SystemProduct format
  const systemProducts = useMemo(() => {
    return productsFromRedux
      .filter(product => product.isActive) // Only show active products
      .map(product => mapProductToSystemProduct(product));
  }, [productsFromRedux]);

  const [formData, setFormData] = useState<CompanyProduct>({
    name: "",
    description: "",
    sku: "",
    // type, price, stock are now in variants
    isAvailableForPurchase: false,
    usedInServices: [],
    image: "",
    tags: [],
    notes: ""
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      sku: "",
      category: "",
      categoryId: undefined,
      // type, price, stock are now in variants
      isAvailableForPurchase: false,
      usedInServices: [],
      image: "",
      tags: [],
      notes: ""
    });
    setSelectedProduct(null);
    setSelectedVariant(null);
    setIsCustomProduct(false);
    setCurrentStep(1);
    setSearchTerm("");
    setVariants([]);
    setHasVariants(false);
    setSelectedVariantForPricing(null);
    setDefaultVariantId(null);
  };

  // Reset form when dialog closes (but not during product creation)
  useEffect(() => {
    if (!open && !isCreatingRef.current) {
      resetForm();
    }
  }, [open]);

  const handleProductSelect = (product: SystemProduct) => {
    // Check if product has changed - if so, reset variants
    const productChanged = selectedProduct?.id !== product.id;
    
    setSelectedProduct(product);
    setSelectedVariant(null);
    setIsCustomProduct(false);
    
    // Reset variants if product has changed
    if (productChanged) {
      setVariants([]);
      setHasVariants(false);
      setSelectedVariantForPricing(null);
      setDefaultVariantId(null);
    }
    
    // Convert tags to string array if they are Tag objects
    const tagStrings = product.tags.map(tag => 
      typeof tag === 'string' ? tag : tag.name
    );
    
    // Initialize form data with selected product
    setFormData({
      systemProductId: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      // type, price, stock are now in variants
      isAvailableForPurchase: false,
      usedInServices: [],
      image: product.image,
      tags: tagStrings,
      notes: ""
    });
  };

  const handleCreateCustom = () => {
    setIsCustomProduct(true);
    setSelectedProduct(null);
    setSelectedVariant(null);
  };

  const handleSubmit = () => {
    // For custom products, we need name and SKU
    if (isCustomProduct && (!formData.name || !formData.sku)) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Require system product selection for non-custom products
    if (!isCustomProduct && !selectedProduct && !formData.systemProductId) {
      toast.error("Please select a system product");
      return;
    }

    // Require at least one variant
    if (!hasVariants || variants.length === 0) {
      toast.error("Please add at least one variant");
      return;
    }

    // Validate all variants
    // Note: Price and stock are handled separately, so we only validate variant identification and type
    const invalidVariants = variants.filter(v => {
      // For system products, require systemProductVariantId
      if (!isCustomProduct && !v.systemProductVariantId) {
        return true; // Invalid - missing system variant selection
      }
      
      // For custom products, require name and SKU
      if (isCustomProduct && (!v.name || !v.sku)) {
        return true; // Invalid - missing name or SKU
      }
      
      // All variants need type
      if (!v.type) {
        return true; // Invalid - missing type
      }
      
      return false; // Valid
    });
    
    if (invalidVariants.length > 0) {
      if (!isCustomProduct) {
        toast.error("All variants must have a selected system variant and type");
      } else {
        toast.error("All variants must have a name, SKU, and type");
      }
      return;
    }

    if (!currentUser?.companyId) {
      toast.error("Company ID is required");
      return;
    }

    // Transform formData to API format (only company-specific data, no duplicate system product data)
    // Note: Tags are inherited from the system product, so we don't send tagIds
    // type, price, stock are now in variants
    const systemProductId = formData.systemProductId || selectedProduct?.id;
    if (!systemProductId && !isCustomProduct) {
      toast.error("System product ID is required");
      return;
    }
    
    const productData: any = {
      companyId: currentUser.companyId,
      systemProductId: isCustomProduct ? undefined : systemProductId, // Required - references system product
      isAvailableForPurchase: formData.isAvailableForPurchase,
      notes: formData.notes || undefined
      // tagIds removed - tags are inherited from system product
    };

    // Prepare variants data if they exist
    // Note: Price and stock are handled separately, so we only include variant identification and type
    let variantData: any[] = [];
    if (hasVariants && variants.length > 0) {
      // If there's only one variant, it should be the default
      const shouldSetSingleAsDefault = variants.length === 1;
      
      variantData = variants.map((v, index) => {
        // Determine if this variant should be default:
        // 1. If it's the only variant, set as default
        // 2. Otherwise, use the isDefault value from the variant
        const isDefault = shouldSetSingleAsDefault ? true : (v.isDefault === true);
        
        return {
          systemProductVariantId: v.systemProductVariantId, // Reference to system product variant
          type: v.type || 'service',
          isDefault: isDefault, // Set as default if single variant, otherwise use UI selection
          isActive: v.isActive !== undefined ? v.isActive : true,
          minStock: v.stock?.minimum !== undefined ? v.stock.minimum : 10,
          maxStock: v.stock?.maximum !== undefined ? v.stock.maximum : 100
          // Note: Price and stock fields (costPrice, sellPrice, currentStock, stockUnit) 
          // are handled separately in the stock table, but minStock and maxStock are stored on the variant
        };
      });
      
      productData.variants = variantData;
      console.log('💾 Including variants in product creation request:', variantData.length);
      console.log('💾 Variants data:', JSON.stringify(variantData, null, 2));
    }
    
    // Set creating flag BEFORE dispatching
    isCreatingRef.current = true;
    creationStartedRef.current = true;
    previousCompanyProductsCount.current = companyProducts.companyProducts.length;
    
    console.log('📤 Dispatching product creation request with variants:', variantData.length);
    console.log('📦 Product data:', JSON.stringify(productData, null, 2));
    
    // Dispatch Redux action to create company product (with variants)
    // Backend will handle creating both company_products and company_product_variants in one transaction
    dispatch(createCompanyProductRequest(productData));
  };

  // Track previous company products count to detect new additions
  const previousCompanyProductsCount = useRef(0);
  const companyProducts = useAppSelector((state) => state.companyProducts);
  const isCreatingRef = useRef(false);
  
  // Initialize count when dialog FIRST opens (only once, not during creation)
  const dialogInitializedRef = useRef(false);
  const initialOpenRef = useRef(false);
  const creationStartedRef = useRef(false);
  
  useEffect(() => {
    // Only initialize on the FIRST open, not on subsequent re-renders
    // AND only if we're not currently creating a product
    if (open && !initialOpenRef.current && !isCreatingRef.current && !creationStartedRef.current) {
      initialOpenRef.current = true;
      previousCompanyProductsCount.current = companyProducts.companyProducts.length;
      dialogInitializedRef.current = true;
      console.log('📊 Dialog FIRST opened, initial products count:', previousCompanyProductsCount.current);
    } else if (!open && initialOpenRef.current) {
      // Reset flags when dialog closes
      initialOpenRef.current = false;
      dialogInitializedRef.current = false;
      creationStartedRef.current = false;
    }
  }, [open]);
  
  // Store the created product ID for variant creation
  const createdProductIdRef = useRef<string | null>(null);
  const variantsCreatedRef = useRef<boolean>(false);
  
  // Get variant creation state from Redux
  const { loading: variantsLoading, error: variantsError } = useAppSelector((state) => state.companyProductVariants);

  // Store variants data to preserve it during product creation
  const variantsDataRef = useRef<ProductVariant[]>([]);
  const hasVariantsRef = useRef<boolean>(false);

  // Handle successful product creation
  useEffect(() => {
    const currentCount = companyProducts.companyProducts.length;
    
    console.log('🔍 Checking product creation status:', {
      currentCount,
      previousCount: previousCompanyProductsCount.current,
      loading: companyProductsLoading,
      error: companyProductsError,
      isCreating: isCreatingRef.current,
      open,
      hasVariants: hasVariantsRef.current,
      variantsCount: variantsDataRef.current.length
    });
    
    // Only process if dialog is open (to avoid triggering on page refresh)
    if (!open) {
      // Only reset if we're not in the middle of creating
      if (!isCreatingRef.current) {
        previousCompanyProductsCount.current = currentCount;
        createdProductIdRef.current = null;
        variantsCreatedRef.current = false;
        variantsDataRef.current = [];
        hasVariantsRef.current = false;
      }
      return;
    }
    
    // Check if a new product was added (successful creation) and we were actually creating
    // Use a more reliable method: check if count increased AND we're creating AND loading stopped
    const countIncreased = currentCount > previousCompanyProductsCount.current;
    const productWasCreated = countIncreased && !companyProductsLoading && !companyProductsError && isCreatingRef.current && !createdProductIdRef.current;
    
    console.log('🔍 Product creation check:', {
      countIncreased,
      currentCount,
      previousCount: previousCompanyProductsCount.current,
      loading: companyProductsLoading,
      error: companyProductsError,
      isCreating: isCreatingRef.current,
      productWasCreated,
      hasVariants: hasVariantsRef.current,
      variantsCount: variantsDataRef.current.length,
      alreadyCreated: !!createdProductIdRef.current
    });
    
    if (productWasCreated) {
      // Find the newly created product (should be the last one)
      const newProduct = companyProducts.companyProducts[companyProducts.companyProducts.length - 1];
      
      if (!newProduct) {
        console.log('⚠️ Product not found in list');
        return;
      }
      
      createdProductIdRef.current = newProduct.id;
      console.log('✅ Product created successfully (with variants if provided):', newProduct.id);
      
      // Close dialog after a short delay (variants are already created by backend)
      const timer = setTimeout(() => {
        resetForm();
        onOpenChange(false);
        if (onProductAdded) {
          onProductAdded({} as any);
        }
        previousCompanyProductsCount.current = currentCount;
        isCreatingRef.current = false;
        creationStartedRef.current = false;
        createdProductIdRef.current = null;
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    // DON'T update previousCompanyProductsCount here if we just created a product with variants
    // We need to keep it at the old value until variants are created
    // Only update if we're not in the middle of creating a product with variants
    if (!productWasCreated && (!isCreatingRef.current || (!hasVariantsRef.current || variantsCreatedRef.current))) {
      previousCompanyProductsCount.current = currentCount;
    }
    
    // Reset creating flag when loading stops AND dialog is closed AND we're done
    if (!companyProductsLoading && !open && (!hasVariantsRef.current || variantsCreatedRef.current)) {
      isCreatingRef.current = false;
      createdProductIdRef.current = null;
      variantsCreatedRef.current = false;
      variantsDataRef.current = [];
      hasVariantsRef.current = false;
      previousCompanyProductsCount.current = currentCount;
    }
  }, [companyProducts.companyProducts.length, companyProductsLoading, companyProductsError, onOpenChange, onProductAdded, open, dispatch]);

  // Handle successful variant creation
  useEffect(() => {
    if (!open || !variantsCreatedRef.current) return;
    
    // Check if variants were created successfully
    if (!variantsLoading && !variantsError && variantsCreatedRef.current && createdProductIdRef.current) {
      // Variants created successfully, close dialog
      const timer = setTimeout(() => {
        resetForm();
        onOpenChange(false);
        if (onProductAdded) {
          onProductAdded({} as any);
        }
        isCreatingRef.current = false;
        createdProductIdRef.current = null;
        variantsCreatedRef.current = false;
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    // Handle variant creation error
    if (variantsError && variantsCreatedRef.current) {
      console.error('Error creating variants:', variantsError);
      toast.error(`Product created but failed to create variants: ${variantsError}`);
      // Still close dialog but show error
      const timer = setTimeout(() => {
        resetForm();
        onOpenChange(false);
        if (onProductAdded) {
          onProductAdded({} as any);
        }
        isCreatingRef.current = false;
        createdProductIdRef.current = null;
        variantsCreatedRef.current = false;
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [variantsLoading, variantsError, open, onOpenChange, onProductAdded]);

  const filteredProducts = systemProducts.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const matchesName = product.name?.toLowerCase().includes(searchLower) || false;
    const matchesDescription = product.description?.toLowerCase().includes(searchLower) || false;
    
    // Safely handle tags - check if tags exists and is an array
    const matchesTags = Array.isArray(product.tags) && product.tags.some(tag => {
      // Handle both string tags and Tag objects
      if (typeof tag === 'string') {
        return tag.toLowerCase().includes(searchLower);
      } else if (tag && typeof tag === 'object') {
        // Tag object with name property
        return tag.name?.toLowerCase().includes(searchLower) || 
               tag.description?.toLowerCase().includes(searchLower);
      }
      return false;
    });
    
    const matchesSearch = matchesName || matchesDescription || matchesTags;
    const notAlreadyAdded = !existingProductSKUs.includes(product.sku);
    return matchesSearch && notAlreadyAdded;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "sell": return "bg-blue-500/20 text-blue-600 dark:text-blue-400";
      case "service": return "bg-purple-500/20 text-purple-600 dark:text-purple-400";
      case "both": return "bg-orange-500/20 text-orange-600 dark:text-orange-400";
      default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "sell": return "For Sale";
      case "service": return "Service Use";
      case "both": return "Both";
      default: return type;
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step <= currentStep 
              ? 'bg-[var(--accent-primary)] text-[var(--accent-button-text)]' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {step < currentStep ? (
              <Check className="w-4 h-4" />
            ) : (
              step
            )}
          </div>
          {step < totalSteps && (
            <div className={`w-12 h-0.5 mx-2 ${
              step < currentStep ? 'bg-[var(--accent-primary)]' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Product Selection";
      case 2: return "Add Variants (Optional)";
      case 3: return hasVariants ? "Review & Submit" : "Product Configuration";
      default: return "";
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!selectedProduct && !isCustomProduct) {
        toast.error("Please select a product first");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // If no variants, skip to step 3
      if (!hasVariants || variants.length === 0) {
        setCurrentStep(3);
      } else {
        // If variants exist, set the first variant for pricing
        setSelectedVariantForPricing(variants[0]);
        setCurrentStep(3);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep === 3) {
      if (hasVariants && variants.length > 0) {
        setCurrentStep(2);
      } else {
        setCurrentStep(1);
      }
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  // Auto-generate SKU based on variant details
  const generateVariantSKUFromDetails = (variant: ProductVariant): string => {
    return generateVariantSKU(
      formData.name || selectedProduct?.name || 'Product',
      formData.sku || selectedProduct?.sku,
      {
        name: variant.name,
        color: variant.color,
        size: variant.size,
        sizeUnit: variant.sizeUnit
      }
    );
  };

  const handleAddVariant = () => {
    const variantIndex = variants.length;
    const newVariant: ProductVariant = {
      id: `temp-${Date.now()}-${variantIndex}`,
      systemProductVariantId: undefined, // Will be set when user selects from dropdown
      name: "",
      sku: "",
      color: "",
      size: "",
      sizeUnit: 'ml',
      weight: "",
      weightUnit: 'g',
      material: "",
      type: "service", // Default type for variant
      isActive: true,
      isDefault: variants.length === 0, // First variant is default by default
      price: { cost: 0, sell: 0 },
      stock: { current: 0, minimum: 10, maximum: 100, unit: "pieces" }
    };
    const updatedVariants = [...variants, newVariant];
    setVariants(updatedVariants);
    setHasVariants(true);
    if (variants.length === 0) {
      setDefaultVariantId(newVariant.id!);
    }
  };

  const handleSelectSystemVariant = (index: number, variantId: string | null, systemVariant: SystemProductVariant | null) => {
    const updatedVariants = [...variants];
    if (systemVariant) {
      // Populate variant details from system variant
      updatedVariants[index] = {
        ...updatedVariants[index],
        systemProductVariantId: variantId || undefined,
        name: systemVariant.name,
        sku: systemVariant.sku,
        color: systemVariant.color || "",
        size: systemVariant.size || "",
        sizeUnit: systemVariant.size?.match(/^(\d+)(ml|L)$/i)?.[2]?.toLowerCase() === 'l' ? 'L' : 'ml',
        weight: systemVariant.weight || "",
        weightUnit: systemVariant.weight?.match(/^(\d+)(mg|g|kg)$/i)?.[2]?.toLowerCase() === 'kg' ? 'kg' : 
                   systemVariant.weight?.match(/^(\d+)(mg|g|kg)$/i)?.[2]?.toLowerCase() === 'mg' ? 'mg' : 'g',
        material: systemVariant.material || "",
      };
    } else {
      // Clear variant details if selection is cleared
      updatedVariants[index] = {
        ...updatedVariants[index],
        systemProductVariantId: undefined,
        name: "",
        sku: "",
        color: "",
        size: "",
        weight: "",
        material: "",
      };
    }
    setVariants(updatedVariants);
  };

  const handleRemoveVariant = (index: number) => {
    const variantToRemove = variants[index];
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
    if (newVariants.length === 0) {
      setHasVariants(false);
      setDefaultVariantId(null);
    } else {
      // If removed variant was default, set first variant as default
      if (defaultVariantId === variantToRemove.id) {
        setDefaultVariantId(newVariants[0].id || null);
        newVariants[0].isDefault = true;
      }
    }
    if (selectedVariantForPricing && variants[index] === selectedVariantForPricing) {
      setSelectedVariantForPricing(newVariants[0] || null);
    }
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = [...variants];
    
    // Update the field
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    
    // Auto-generate SKU when variant details change (name, color, size)
    if (field === 'name' || field === 'color' || field === 'size' || field === 'sizeUnit') {
      const variant = updatedVariants[index];
      // Always auto-generate if we have at least a variant name
      if (variant.name && variant.name.trim()) {
        updatedVariants[index].sku = generateVariantSKUFromDetails(variant);
      }
    }
    
    // Handle default variant selection
    if (field === 'isDefault' && value === true) {
      // Unset other variants as default
      updatedVariants.forEach((v, i) => {
        if (i !== index) {
          v.isDefault = false;
        }
      });
      setDefaultVariantId(updatedVariants[index].id || null);
    }
    
    setVariants(updatedVariants);
    
    // Update selectedVariantForPricing if it's the variant being updated
    if (selectedVariantForPricing && variants[index] === selectedVariantForPricing) {
      setSelectedVariantForPricing(updatedVariants[index]);
    }
  };
  
  const handleSetDefaultVariant = (variantId: string | null) => {
    setDefaultVariantId(variantId);
    const updatedVariants = variants.map(v => ({
      ...v,
      isDefault: v.id === variantId
    }));
    setVariants(updatedVariants);
  };

  // Sync selectedVariantForPricing with variants array when variants change
  useEffect(() => {
    if (hasVariants && variants.length > 0 && selectedVariantForPricing) {
      const index = variants.findIndex(v => v === selectedVariantForPricing);
      if (index >= 0) {
        setSelectedVariantForPricing(variants[index]);
      } else if (variants.length > 0) {
        // If selected variant is no longer in the array, select the first one
        setSelectedVariantForPricing(variants[0]);
      }
    }
  }, [variants, hasVariants]);

  // Render footer buttons based on current step
  const renderFooter = () => {
    if (currentStep === 1) {
      return (
        <>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!selectedProduct}
            variant="accent"
            className="flex-1"
          >
            Next: {hasVariants ? "Add Variants" : "Skip to Configuration"}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </>
      );
    } else if (currentStep === 2) {
      return (
        <>
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleNext}
            variant="accent"
            className="flex-1"
          >
            Next: Configure {hasVariants && variants.length > 0 ? 'Variants' : 'Product'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </>
      );
    } else if (currentStep === 3) {
      return (
        <>
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={companyProductsLoading || !formData.name || (isCustomProduct && !formData.sku)}
            variant="accent"
            className="flex-1"
          >
            {companyProductsLoading ? "Adding..." : "Add Product"}
          </Button>
        </>
      );
    }
    return null;
  };

  return (
    <>
    <CustomDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="Add Product to Company"
      description="Choose from system products or create a custom product for your company"
      icon={<Package className="w-5 h-5" />}
      maxWidth="max-w-4xl"
      disableContentScroll={true}
      footer={
        <div className="flex items-center gap-3 w-full sm:flex-row sm:justify-start">
          {renderFooter()}
        </div>
      }
    >
      <div className="space-y-6 flex flex-col h-full overflow-hidden">
        <StepIndicator />
        
          {/* Step 1: Product Selection */}
          {currentStep === 1 && (
            <div className="space-y-6 flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search products by name, category, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Company Tags */}
              {currentUser?.companyId && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TagIcon className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm font-medium text-foreground">Company Tags</Label>
                  </div>
                  {loadingCompanyTags ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading company tags...</span>
                    </div>
                  ) : companyTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {companyTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-xs"
                          style={{ 
                            backgroundColor: `${tag.color}20`, 
                            color: tag.color,
                            borderColor: `${tag.color}40`
                          }}
                        >
                          {tag.icon && <span className="mr-1">{tag.icon}</span>}
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags assigned to this company</p>
                  )}
                </div>
              )}

              {/* System Products */}
              {productsLoading ? (
                <Card className="p-8 text-center backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Loading Products</h3>
                  <p className="text-muted-foreground">Please wait while we load available products...</p>
                </Card>
              ) : filteredProducts.length > 0 ? (
                <div className="space-y-4 flex flex-col flex-1 min-h-0">
                  <div className="flex items-center justify-between flex-shrink-0">
                    <h3 className="text-lg font-medium text-foreground">Available Products ({filteredProducts.length})</h3>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddSystemProductDialog(true)}
                      className="border-dashed"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New System Product
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0" style={{ maxHeight: 'calc(100vh - 450px)' }}>
                    {filteredProducts.map((product) => (
                      <Card 
                        key={product.id} 
                        className={`p-4 backdrop-blur-sm transition-all duration-200 cursor-pointer ${
                          selectedProduct?.id === product.id 
                            ? 'bg-[var(--accent-bg)] border-[var(--accent-border)]' 
                            : 'bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--accent-border)]'
                        }`}
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="flex items-start gap-3">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-foreground truncate">{product.name}</h4>
                              <div className="flex items-center gap-2 ml-2">
                                {product.hasVariants && (
                                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    {product.variants?.length || 0} variants
                                  </Badge>
                                )}
                                {selectedProduct?.id === product.id && (
                                  <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center ml-2">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card className="p-8 text-center backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Products Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Try adjusting your search terms" : "No products available to add"}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddSystemProductDialog(true)}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New System Product
                  </Button>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Add Variants (Optional) */}
          {currentStep === 2 && (
            <div className="space-y-6 flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Selected Product Display */}
              {(selectedProduct || isCustomProduct) && (
                <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] flex-shrink-0">
                  <div className="flex items-start gap-4">
                    <img 
                      src={selectedProduct?.image || formData.image || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop"} 
                      alt={formData.name}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">{formData.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{formData.description}</p>
                    </div>
                    {selectedProduct && (
                      <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </Card>
              )}

              <div className="space-y-4 flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between flex-shrink-0">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Product Variants</h3>
                    <p className="text-sm text-muted-foreground">Add variants if this product has different sizes, colors, or options (optional)</p>
                  </div>
                  <Button
                    onClick={handleAddVariant}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variant
                  </Button>
                </div>

                {variants.length > 0 ? (
                  <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0" style={{ maxHeight: 'calc(100vh - 500px)' }}>
                    {variants.map((variant, index) => (
                      <Card key={variant.id || index} className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground text-lg">{variant.name || `Variant ${index + 1}`}</h4>
                              {variant.isDefault && (
                                <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 text-xs">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 text-xs">
                                Active
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleRemoveVariant(index)} className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          {variant.sku && (
                            <p className="text-sm text-muted-foreground">SKU: {variant.sku}</p>
                          )}
                          
                          {/* System Product Variant Selector - Only show if system product is selected */}
                          {selectedProduct && !isCustomProduct && (
                            <div className="mb-4">
                              <Label>Select System Product Variant *</Label>
                              <SystemProductVariantSelector
                                productId={selectedProduct.id}
                                value={variant.systemProductVariantId || null}
                                onChange={(variantId, systemVariant) => {
                                  handleSelectSystemVariant(index, variantId || "", systemVariant);
                                }}
                                className="mt-1"
                                placeholder="Select a variant from system product..."
                                productName={selectedProduct.name}
                                productSKU={selectedProduct.sku}
                              />
                              {variant.systemProductVariantId && variant.name && (
                                <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    <strong>Selected:</strong> {variant.name}
                                    {variant.color && ` - ${variant.color}`}
                                    {variant.size && ` (${variant.size})`}
                                    {variant.sku && ` - SKU: ${variant.sku}`}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Pricing & Stock Form - Only show after variant is selected (for system products) or always (for custom products) */}
                          {((selectedProduct && !isCustomProduct && variant.systemProductVariantId) || isCustomProduct || !selectedProduct) && (
                            <VariantForm
                              variant={variant as VariantFormData}
                              onChange={(field, value) => {
                                // Handle nested objects (price, stock) specially
                                if (field === 'price' || field === 'stock') {
                                  handleUpdateVariant(index, field, value);
                                } else if (field === 'type') {
                                  handleUpdateVariant(index, 'type', value);
                                } else {
                                  // Don't allow editing variant details if it's from system product
                                  if (selectedProduct && !isCustomProduct && variant.systemProductVariantId) {
                                    if (field === 'name' || field === 'sku' || field === 'color' || field === 'size' || field === 'weight' || field === 'material') {
                                      return; // Ignore changes to variant details from system product
                                    }
                                  }
                                  handleUpdateVariant(index, field as keyof ProductVariant, value);
                                }
                              }}
                              onDefaultChange={(isDefault) => handleSetDefaultVariant(isDefault ? variant.id || null : null)}
                              showDefaultCheckbox={true}
                              skuLabel="SKU * (Auto-generated)"
                              mode="company" // Always company mode for pricing/stock
                              hideVariantDetails={selectedProduct && !isCustomProduct && !!variant.systemProductVariantId} // Hide variant details when using system variant
                            />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-medium text-foreground mb-2">No Variants Added</h4>
                    <p className="text-muted-foreground text-sm mb-4">Click "Add Variant" to create variants, or skip this step if not needed.</p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Pricing & Stock Configuration */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Selected Product Display */}
              {(selectedProduct || isCustomProduct) && (
                <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <div className="flex items-start gap-4">
                    <img 
                      src={selectedProduct?.image || formData.image || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop"} 
                      alt={formData.name}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">{formData.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{formData.description}</p>
                    </div>
                    {selectedProduct && (
                      <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Note: Product Type is in variants, but Pricing & Stock are handled separately */}
              {hasVariants && variants.length > 0 ? (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <strong>Note:</strong> Product type for variants is configured in Step 2. Pricing and stock information are managed separately in the Stock Details page. Review the variants summary below before submitting.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    <strong>Note:</strong> This product has no variants. Please add at least one variant in Step 2 with type information. Pricing and stock can be configured later in the Stock Details page.
                  </p>
                </div>
              )}

              {/* Variants Summary - Show all variants before submission */}
              {hasVariants && variants.length > 0 && (
                <div className="space-y-4">
                  <div className="border-t border-[var(--glass-border)] pt-4">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Variants Summary</h3>
                    <p className="text-sm text-muted-foreground mb-4">Review all variants before submitting:</p>
                    <div className="space-y-3">
                      {variants.map((variant, index) => (
                        <Card key={variant.id || index} className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-foreground">{variant.name || `Variant ${index + 1}`}</h4>
                                {variant.isDefault && (
                                  <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 text-xs">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                SKU: {variant.sku}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Color:</span>
                                <span className="ml-2 text-foreground">{variant.color || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Size:</span>
                                <span className="ml-2 text-foreground">
                                  {variant.size ? (
                                    /(ml|L)$/i.test(variant.size)
                                      ? variant.size 
                                      : `${variant.size}${variant.sizeUnit || 'ml'}`
                                  ) : 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Weight:</span>
                                <span className="ml-2 text-foreground">
                                  {variant.weight ? (
                                    /(mg|g|kg)$/i.test(variant.weight)
                                      ? variant.weight
                                      : `${variant.weight}${variant.weightUnit || 'g'}`
                                  ) : 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Material:</span>
                                <span className="ml-2 text-foreground">{variant.material || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Type:</span>
                                <span className="ml-2 text-foreground">
                                  {variant.type === 'sell' ? 'For Sale' : variant.type === 'service' ? 'Service Use' : 'Both'}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Min Stock:</span>
                                <span className="ml-2 text-foreground">
                                  {variant.stock?.minimum !== undefined ? variant.stock.minimum : 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Max Stock:</span>
                                <span className="ml-2 text-foreground">
                                  {variant.stock?.maximum !== undefined ? variant.stock.maximum : 'N/A'}
                                </span>
                              </div>
                            </div>

                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </CustomDialog>

      {/* Add New System Product Dialog */}
      <Dialog open={showAddSystemProductDialog} onOpenChange={setShowAddSystemProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <DialogHeader>
            <DialogTitle>Add New System Product</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              This product will be saved as unverified and will need to be verified by a system admin.
            </p>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Brand */}
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input
                value={newSystemProductData.brand}
                onChange={(e) => setNewSystemProductData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Enter brand name"
                className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
              />
            </div>

            {/* Product Name */}
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input
                value={newSystemProductData.name}
                onChange={(e) => setNewSystemProductData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Product name"
                className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newSystemProductData.description}
                onChange={(e) => setNewSystemProductData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Product description"
                className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground min-h-[80px]"
                rows={3}
              />
            </div>

            {/* Product Image */}
            <div className="space-y-2">
              <Label>Product Image</Label>
              <FileUpload
                onFileUploaded={(filePath) => setNewSystemProductData(prev => ({ ...prev, imageUrl: filePath }))}
                onFileDeleted={() => setNewSystemProductData(prev => ({ ...prev, imageUrl: "" }))}
                currentImagePath={newSystemProductData.imageUrl}
                currentImageUrl={newSystemProductData.imageUrl ? formatAvatarUrl(newSystemProductData.imageUrl) : undefined}
                folderPath="products"
                label="Upload Product Image"
                maxSize={5}
                className="w-full"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <TagSelector
                value={newSystemProductData.tagIds}
                onChange={(tagIds) => {
                  setNewSystemProductData(prev => ({ ...prev, tagIds }));
                }}
                placeholder="Select tags for this product"
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddSystemProductDialog(false);
                setNewSystemProductData({
                  brand: "",
                  name: "",
                  description: "",
                  imageUrl: "",
                  tagIds: []
                });
              }}
              disabled={isCreatingSystemProduct}
              className="flex-1 border-[var(--glass-border)] hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)] text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!newSystemProductData.name.trim()) {
                  toast.error("Product name is required");
                  return;
                }

                setIsCreatingSystemProduct(true);
                try {
                  const productData = {
                    brand: newSystemProductData.brand.trim() || undefined,
                    name: newSystemProductData.name.trim(),
                    description: newSystemProductData.description || undefined,
                    imageUrl: newSystemProductData.imageUrl || undefined,
                    isActive: true,
                    isVerified: false, // Company owners create unverified products
                    tagIds: newSystemProductData.tagIds.length > 0 ? newSystemProductData.tagIds : undefined
                  };

                  const createdProduct = await productsService.createProduct(productData);
                  
                  // Refresh the product list
                  dispatch(fetchSystemProductsRequest({ isActive: true }));
                  
                  // Select the newly created product
                  const mappedProduct = mapProductToSystemProduct(createdProduct);
                  setSelectedProduct(mappedProduct);
                  setIsCustomProduct(false);
                  
                  // Close dialog and reset form
                  setShowAddSystemProductDialog(false);
                  setNewSystemProductData({
                    brand: "",
                    name: "",
                    description: "",
                    imageUrl: "",
                    tagIds: []
                  });
                  
                  toast.success("Product added successfully. It will be verified by system admin.");
                } catch (error: any) {
                  console.error('Error creating product:', error);
                  toast.error(error?.message || "Failed to add product");
                } finally {
                  setIsCreatingSystemProduct(false);
                }
              }}
              disabled={isCreatingSystemProduct || !newSystemProductData.name.trim()}
              className="flex-1 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingSystemProduct ? "Adding..." : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}