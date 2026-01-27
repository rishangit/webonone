import { useState, useMemo, useEffect } from "react";
import { useIsMobile } from "../../components/ui/use-mobile";
import { 
  Check, FileText, Clock, Search, Plus, X, Trash2, Calculator, 
  Package, DollarSign, Percent, ShoppingCart, Receipt, User, Calendar
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

import { CustomDialog } from "../../components/ui/custom-dialog";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCompanyProductsRequest } from "../../store/slices/companyProductsSlice";
import { fetchServicesRequest } from "../../store/slices/servicesSlice";
import { formatAvatarUrl } from "../../utils";
import { CompanyProduct } from "../../services/companyProducts";
import { CompanyProductVariant } from "../../services/companyProductVariants";
import { Service as ServiceType } from "../../services/services";
import { companyProductVariantsService } from "../../services/companyProductVariants";
import { Currency } from "../../services/currencies";
import { fetchCurrencyRequest } from "../../store/slices/currenciesSlice";

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  attributes: {
    size?: string;
    color?: string;
    weight?: string;
    volume?: string;
    [key: string]: string | undefined;
  };
  price: number;
  inStock: number;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  inStock: number;
  image?: string;
  hasVariants?: boolean;
  variants?: ProductVariant[];
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image?: string;
}

interface BillingItem {
  id: string;
  type: "product" | "service";
  // IDs for reference (required)
  productId?: string;
  variantId?: string;
  serviceId?: string;
  // Display data (for UI only, not saved to DB)
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  unit?: string;
  variantVolume?: string; // Store volume info for price display formatting
  displayPrice?: number; // Store the full volume price for display
}

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAvatar?: string;
  service: string;
  serviceId?: string;
  servicePrice: number;
  provider: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  status: string;
}

interface AppointmentBillingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
  onComplete: (data: {
    status: string;
    notes: string;
    billingItems: BillingItem[];
    totalAmount: number;
  }) => void;
}


export function AppointmentBillingDialog({
  open,
  onOpenChange,
  appointment,
  onComplete
}: AppointmentBillingDialogProps) {
  const dispatch = useAppDispatch();
  const { companyProducts: reduxCompanyProducts, loading: productsLoading, error: productsError } = useAppSelector((state) => state.companyProducts);
  const { services: reduxServices, loading: servicesLoading, error: servicesError } = useAppSelector((state) => state.services);
  const { user } = useAppSelector((state) => state.auth);
  const { companies, currentCompany, userCompany } = useAppSelector((state) => state.companies);
  const { currencies: reduxCurrencies, currenciesById } = useAppSelector((state) => state.currencies);

  // Safety check to prevent object rendering errors
  if (!appointment) {
    return null;
  }

  // Get companyId from appointment or current user
  const companyId = (appointment as any).companyId || user?.companyId;

  // Mobile detection
  const isMobile = useIsMobile();

  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);

  // Fetch company currency from Redux cache
  useEffect(() => {
    if (!companyId) {
      // Try to get USD as default if no company ID
      const usdCurrency = reduxCurrencies.find(c => c.name === 'USD');
      setCompanyCurrency(usdCurrency || null);
      return;
    }
    
    // Use userCompany if it matches the current user's companyId (cached)
    let company = (userCompany && String(userCompany.id) === String(companyId)) 
      ? userCompany 
      : companies.find(c => String(c.id) === String(companyId)) || currentCompany;
    
    const currencyId = company?.currencyId;
    
    if (currencyId) {
      // Check Redux cache first
      const cachedCurrency = currenciesById[currencyId];
      if (cachedCurrency) {
        setCompanyCurrency(cachedCurrency);
      } else {
        // If not in cache, fetch it (will be cached by epic)
        dispatch(fetchCurrencyRequest(currencyId));
        // Set a temporary USD fallback while fetching
        const usdCurrency = reduxCurrencies.find(c => c.name === 'USD');
        setCompanyCurrency(usdCurrency || null);
      }
    } else {
      // If no currency is set, use USD as default
      const usdCurrency = reduxCurrencies.find(c => c.name === 'USD');
      setCompanyCurrency(usdCurrency || null);
    }
  }, [companyId, companies, currentCompany, userCompany, reduxCurrencies, currenciesById, dispatch]);
  
  // Update currency when it's fetched and cached
  useEffect(() => {
    if (companyId) {
      const company = (userCompany && String(userCompany.id) === String(companyId)) 
        ? userCompany 
        : companies.find(c => String(c.id) === String(companyId)) || currentCompany;
      const currencyId = company?.currencyId;
      if (currencyId && currenciesById[currencyId]) {
        setCompanyCurrency(currenciesById[currencyId]);
      }
    }
  }, [currenciesById, companyId, companies, currentCompany, userCompany]);

  // Utility function for formatting currency
  const formatCurrency = (amount: number) => {
    const numPrice = Number(amount) || 0;
    
    if (isNaN(numPrice)) {
      return companyCurrency ? `${companyCurrency.symbol} ${(0).toFixed(companyCurrency.decimals || 2)}` : '$ 0.00';
    }
    
    if (companyCurrency) {
      const decimals = companyCurrency.decimals || 2;
      const roundedPrice = Math.round(numPrice / companyCurrency.rounding) * companyCurrency.rounding;
      const formattedNumber = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(roundedPrice);
      return `${companyCurrency.symbol} ${formattedNumber}`;
    }
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(numPrice);
    return formatted.replace('$', '$ ');
  };

  const [status, setStatus] = useState("completed");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Billing states
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  
  // Initialize billing items when dialog opens
  useEffect(() => {
    if (open && appointment) {
      // Always add initial service item (serviceId will be included if available)
      setBillingItems([
        {
          id: "service-1",
          type: "service",
          serviceId: appointment.serviceId, // Will be undefined if not available, but item will still be shown
          name: appointment.service || "Service",
          description: "Professional service provided",
          quantity: 1,
          unitPrice: appointment.servicePrice || 0,
          discount: 0
        }
      ]);
    } else if (!open) {
      // Reset when dialog closes
      setBillingItems([]);
    }
  }, [open, appointment]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showItemSearch, setShowItemSearch] = useState(false);
  const [searchType, setSearchType] = useState<'products' | 'services'>('products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showVariantSelection, setShowVariantSelection] = useState(false);
  const [productVariantsMap, setProductVariantsMap] = useState<Record<string, CompanyProductVariant[]>>({});

  // Fetch products and services when dialog opens
  useEffect(() => {
    if (open && companyId) {
      console.log('[AppointmentBillingDialog] Fetching products and services for companyId:', companyId);
      dispatch(fetchCompanyProductsRequest({ companyId }));
      dispatch(fetchServicesRequest({ companyId }));
    }
  }, [open, companyId, dispatch]);

  // Fetch variants for all products when products are loaded
  useEffect(() => {
    if (reduxCompanyProducts.length > 0) {
      const fetchAllVariants = async () => {
        const variantsMap: Record<string, CompanyProductVariant[]> = {};
        
        // Fetch variants for each product
        await Promise.all(
          reduxCompanyProducts.map(async (product) => {
            try {
              const variants = await companyProductVariantsService.getVariantsByCompanyProductId(product.id);
              if (variants.length > 0) {
                variantsMap[product.id] = variants;
              }
            } catch (error) {
              console.error(`Error fetching variants for product ${product.id}:`, error);
            }
          })
        );
        
        setProductVariantsMap(variantsMap);
      };
      
      fetchAllVariants();
    }
  }, [reduxCompanyProducts]);

  // Map company products to Product interface
  const companyProducts: Product[] = useMemo(() => {
    console.log('[AppointmentBillingDialog] Mapping products. Total redux products:', reduxCompanyProducts.length);
    // For billing purposes, show ALL products regardless of isAvailableForPurchase flag
    // The isAvailableForPurchase flag is for customer-facing purchases, not for billing during appointments
    return reduxCompanyProducts
      .map((product: CompanyProduct) => {
        const variants = productVariantsMap[product.id] || [];
        console.log(`[AppointmentBillingDialog] Product ${product.name} (${product.id}):`, {
          totalVariants: variants.length,
          variants: variants.map(v => ({ id: v.id, name: v.name, type: v.type, isActive: v.isActive }))
        });
        // For billing purposes, show all active variants (sell, service, or both)
        // This allows products used in services to be billable
        const activeVariants = variants.filter(v => v.isActive);
        console.log(`[AppointmentBillingDialog] Product ${product.name} active variants after filter:`, activeVariants.length, activeVariants.map(v => v.name));
        
        // Map variants to ProductVariant interface
        const mappedVariants: ProductVariant[] = activeVariants.map((variant: CompanyProductVariant) => ({
          id: variant.id,
          name: variant.name,
          sku: variant.sku,
          attributes: {
            ...(variant.color && { color: variant.color }),
            ...(variant.size && { size: variant.size }),
            ...(variant.weight && { weight: variant.weight }),
            ...(variant.material && { material: variant.material }),
          },
          price: variant.sellPrice || variant.costPrice || 0,
          inStock: variant.currentStock || 0,
          isActive: variant.isActive
        }));

        // Get default price from variants
        // If no variants, we'll still show the product but with 0 price (user can't add it until variants are added)
        const defaultPrice = activeVariants.length > 0 
          ? (activeVariants.find(v => v.isDefault)?.sellPrice || activeVariants[0]?.sellPrice || activeVariants[0]?.costPrice || 0)
          : 0;

        // Get total stock
        const totalStock = activeVariants.length > 0
          ? activeVariants.reduce((sum, v) => sum + (v.currentStock || 0), 0)
          : 0;

        return {
          id: product.id,
          name: product.name || 'Unnamed Product',
          description: product.description || '',
          price: defaultPrice,
          unit: activeVariants[0]?.stockUnit || 'piece',
          category: product.tags?.[0]?.name || 'Uncategorized',
          inStock: totalStock,
          image: product.imageUrl ? formatAvatarUrl(product.imageUrl) : undefined,
          hasVariants: mappedVariants.length > 1,
          variants: mappedVariants.length > 0 ? mappedVariants : undefined
        };
      })
      .filter(product => {
        // Only show products that have at least one variant with a price, or allow products without variants for now
        // This allows products to show even if variants are still loading
        return true; // Show all products, even if they don't have variants yet
      });
  }, [reduxCompanyProducts, productVariantsMap]);

  // Map services to Service interface
  const companyServices: Service[] = useMemo(() => {
    return reduxServices
      .filter(service => service.status === 'Active')
      .map((service: ServiceType) => ({
        id: service.id,
        name: service.name,
        description: service.description || '',
        price: service.price,
        duration: service.duration,
        category: service.category || 'General',
        image: service.image ? formatAvatarUrl(service.image) : undefined
      }));
  }, [reduxServices]);

  // Debug: Log products and services (after they're defined)
  useEffect(() => {
    if (open) {
      console.log('[AppointmentBillingDialog] Redux company products:', reduxCompanyProducts);
      console.log('[AppointmentBillingDialog] Mapped company products:', companyProducts);
      console.log('[AppointmentBillingDialog] Redux services:', reduxServices);
      console.log('[AppointmentBillingDialog] Mapped services:', companyServices);
      console.log('[AppointmentBillingDialog] Product variants map:', productVariantsMap);
    }
  }, [open, reduxCompanyProducts, companyProducts, reduxServices, companyServices, productVariantsMap]);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return companyProducts;
    return companyProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, companyProducts]);

  // Filter services based on search
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return companyServices;
    return companyServices.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, companyServices]);

  // Calculate billing totals
  const calculations = useMemo(() => {
    const subtotal = billingItems.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    );
    const discountAmount = billingItems.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice * (item.discount / 100)), 0
    );
    const finalAmount = subtotal - discountAmount;

    return {
      subtotal,
      discountAmount,
      finalAmount
    };
  }, [billingItems]);

  const selectProduct = (product: Product) => {
    console.log('[AppointmentBillingDialog] selectProduct called for:', product.name);
    console.log('[AppointmentBillingDialog] product.variants:', product.variants);
    console.log('[AppointmentBillingDialog] product.hasVariants:', product.hasVariants);
    console.log('[AppointmentBillingDialog] variants length:', product.variants?.length);
    
    // Check if product has variants
    if (product.variants && product.variants.length > 0) {
      console.log('[AppointmentBillingDialog] Product has variants, count:', product.variants.length);
      if (product.variants.length === 1) {
        // Only one variant - use it automatically without showing selector
        console.log('[AppointmentBillingDialog] Single variant, auto-selecting:', product.variants[0].name);
        addProductToBill(product, product.variants[0]);
        setShowItemSearch(false); // Close search dialog
      } else {
        // Multiple variants - show variant selection dialog
        console.log('[AppointmentBillingDialog] Multiple variants, showing selector');
        setSelectedProduct(product);
        setSelectedVariant(null);
        setShowItemSearch(false); // Close search dialog first
        setShowVariantSelection(true); // Then show variant selection
      }
    } else if (product.price > 0) {
      // No variants but has a price, add directly to bill
      console.log('[AppointmentBillingDialog] No variants but has price, adding directly');
      addProductToBill(product);
      setShowItemSearch(false); // Close search dialog
    } else {
      // Product has no variants and no price - can't add to bill
      console.log('[AppointmentBillingDialog] No variants and no price');
      toast.error("This product has no variants or pricing information. Please add variants first.");
    }
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    if (selectedProduct) {
      // Add product with variant directly to bill with quantity 1
      addProductToBill(selectedProduct, variant);
      setShowVariantSelection(false);
      setShowItemSearch(false);
    }
  };

  const addProductToBill = (product: Product, variant?: ProductVariant) => {
    const effectivePrice = variant ? variant.price : product.price;
    const effectiveName = variant ? `${product.name} - ${variant.name}` : product.name;
    const effectiveDescription = variant 
      ? `${product.description} (${Object.entries(variant.attributes).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`).join(', ')})`
      : product.description;

    // Handle volume-based pricing display for variants
    let unitPrice = effectivePrice;
    let displayPrice = effectivePrice;
    let quantity = 1;
    let effectiveUnit = product.unit;
    
    if (variant?.attributes?.volume) {
      // Extract volume number (e.g., 30 from "30ml")
      const volumeMatch = variant.attributes.volume.match(/(\d+(?:\.\d+)?)/);
      const volumeAmount = volumeMatch ? parseFloat(volumeMatch[1]) : 1;
      
      // Extract volume unit (e.g., "ml" from "30ml")
      const volumeUnitMatch = variant.attributes.volume.match(/([a-zA-Z]+)/);
      const volumeUnit = volumeUnitMatch ? volumeUnitMatch[1] : "ml";
      
      // For volume-based variants:
      // - unitPrice: per-unit price for calculations ($49.99/30 = $1.6663 per ml)
      // - displayPrice: full volume price for display ($49.99 for 30ml)
      // - quantity: volume amount (30 ml)
      unitPrice = effectivePrice / volumeAmount;
      displayPrice = effectivePrice;
      quantity = volumeAmount;
      effectiveUnit = volumeUnit;
    }
    
    const newItem: BillingItem = {
      id: `product-${Date.now()}`,
      type: "product",
      productId: product.id,
      variantId: variant?.id,
      name: effectiveName,
      description: effectiveDescription,
      quantity: quantity,
      unitPrice: unitPrice, // Per-unit price for calculations
      discount: 0,
      unit: effectiveUnit,
      variantVolume: variant?.attributes?.volume,
      displayPrice: displayPrice // Full volume price for display
    };
    setBillingItems(prev => [...prev, newItem]);
    
    // Reset states
    setSearchQuery("");
    setSelectedProduct(null);
    setSelectedVariant(null);
    setShowItemSearch(false);
    
    toast.success(`${effectiveName} added to bill`);
  };

  const addService = (service: Service) => {
    const newItem: BillingItem = {
      id: `service-${Date.now()}`,
      type: "service",
      serviceId: service.id,
      name: service.name,
      description: service.description,
      quantity: 1,
      unitPrice: service.price,
      discount: 0
    };
    setBillingItems(prev => [...prev, newItem]);
    setSearchQuery("");
    setShowItemSearch(false); // Close the search dialog
    toast.success(`${service.name} added to bill`);
  };

  const removeBillingItem = (itemId: string) => {
    setBillingItems(prev => prev.filter(item => item.id !== itemId));
    toast.success("Item removed from bill");
  };

  const updateBillingItem = (itemId: string, field: keyof BillingItem, value: any) => {
    setBillingItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onComplete({
        status,
        notes,
        billingItems,
        totalAmount: calculations.finalAmount
      });
      
      toast.success("Appointment completed and bill processed successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to process appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Main Appointment & Billing Dialog */}
      <CustomDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Complete Appointment & Billing"
        description={`Complete the appointment session and manage billing for ${appointment?.clientName || "the client"}`}
        icon={<Receipt className="w-5 h-5" />}
        maxWidth={isMobile ? "w-full max-w-full" : "w-[95vw] max-w-[95vw]"}
        className={isMobile ? "h-[100vh] max-h-[100vh] m-0 rounded-none" : "h-[90vh] max-h-[90vh]"}
        footer={
          <div className={`${isMobile ? 'flex flex-col gap-3' : 'flex items-center'}`}>
            <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isMobile ? 'justify-center mb-2' : 'mr-auto'}`}>
              <DollarSign className="w-4 h-4" />
              Final Amount: <span className="font-semibold text-[var(--accent-text)]">{formatCurrency(calculations.finalAmount)}</span>
            </div>
            <div className={`flex gap-3 ${isMobile ? 'w-full' : ''}`}>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className={`border-[var(--accent-border)] text-foreground hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] transition-all duration-200 ${isMobile ? 'flex-1' : ''}`}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${isMobile ? 'flex-1' : ''}`}
              >
                {isSubmitting ? "Processing..." : "Complete & Bill"}
              </Button>
            </div>
          </div>
        }
      >
        <div className={`${isMobile ? 'flex flex-col gap-4' : 'flex gap-6 overflow-hidden h-full'}`}>
          {/* Left Panel - Appointment Details */}
          <div className={`${isMobile ? 'w-full' : 'flex-1'} space-y-4 ${isMobile ? '' : 'overflow-y-auto custom-scrollbar pr-2'}`}>
            {/* Client Info Card */}
            <Card className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-sm">
              <div className={`${isMobile ? 'flex flex-col gap-3' : 'flex items-center gap-4'}`}>
                <div className={`${isMobile ? 'flex items-center gap-3' : 'contents'}`}>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={appointment.clientAvatar} alt={appointment.clientName} />
                    <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
                      {appointment.clientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{appointment.clientName}</h3>
                    <p className="text-sm text-muted-foreground">{appointment.clientEmail}</p>
                    <p className="text-sm text-muted-foreground">{appointment.clientPhone}</p>
                  </div>
                </div>
                <div className={`${isMobile ? 'flex justify-between w-full' : 'text-right'}`}>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {appointment.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {appointment.time}
                  </div>
                </div>
              </div>
            </Card>

            {/* Service Details */}
            <Card className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[var(--accent-text)]" />
                  <h3 className="font-medium text-foreground">Service Details</h3>
                </div>
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                  <div>
                    <Label className="text-sm text-muted-foreground">Service</Label>
                    <p className="font-medium text-foreground">{appointment.service}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Duration</Label>
                    <p className="font-medium text-foreground">{appointment.duration} minutes</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Staff Member</Label>
                    <p className="font-medium text-foreground">{appointment.provider}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Location</Label>
                    <p className="font-medium text-foreground">{appointment.location}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Appointment Status */}
            <Card className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[var(--accent-text)]" />
                  <h3 className="font-medium text-foreground">Session Status</h3>
                </div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
                    <SelectValue placeholder="Select completion status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-xl">
                    <SelectItem value="completed" className="text-foreground hover:bg-accent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Completed Successfully
                      </div>
                    </SelectItem>
                    <SelectItem value="no_show" className="text-foreground hover:bg-accent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Client No-Show
                      </div>
                    </SelectItem>
                    <SelectItem value="cancelled" className="text-foreground hover:bg-accent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        Cancelled
                      </div>
                    </SelectItem>
                    <SelectItem value="partially_completed" className="text-foreground hover:bg-accent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Partially Completed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Session Notes */}
            <Card className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-sm">
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-foreground text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--accent-text)]" />
                  Session Notes
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add detailed notes about the session..."
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground resize-none"
                  rows={4}
                />
              </div>
            </Card>
          </div>

          {/* Right Panel - Billing & Products */}
          <div className={`${isMobile ? 'w-full' : 'flex-1'} flex flex-col overflow-hidden`}>
            {/* Billing Header - Fixed */}
            <div className={`flex-shrink-0 ${isMobile ? 'flex flex-col gap-3' : 'flex items-center justify-between'} mb-4`}>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[var(--accent-text)]" />
                <h3 className="font-medium text-foreground">Billing & Products</h3>
              </div>
              <Button
                onClick={() => setShowItemSearch(!showItemSearch)}
                className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Billing Items List - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                {billingItems.map((item) => (
                  <Card key={item.id} className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-sm">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {item.type === 'product' ? <Package className="w-4 h-4 text-[var(--accent-text)]" /> : <FileText className="w-4 h-4 text-[var(--accent-text)]" />}
                            <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBillingItem(item.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateBillingItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                            className="text-sm bg-[var(--input-background)] border-[var(--glass-border)]"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            {item.variantVolume && item.displayPrice 
                              ? `Price/${item.variantVolume}` 
                              : `Price${item.unit ? `/${item.unit}` : ''}`
                            }
                          </Label>
                          <div className="text-sm font-medium text-foreground p-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded">
                            {item.variantVolume && item.displayPrice 
                              ? formatCurrency(item.displayPrice)
                              : formatCurrency(item.unitPrice)
                            }
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Discount %</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) => updateBillingItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            className="text-sm bg-[var(--input-background)] border-[var(--glass-border)]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                          {item.quantity} × {item.variantVolume && item.displayPrice 
                            ? formatCurrency(item.displayPrice)
                            : formatCurrency(item.unitPrice)
                          }
                          {item.discount > 0 && ` (-${item.discount}%)`}
                        </span>
                        <span className="font-medium text-foreground">
                          {formatCurrency((item.quantity * item.unitPrice) * (1 - item.discount / 100))}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Billing Summary - Fixed */}
            <div className="flex-shrink-0 mt-4 pt-4 border-t border-border">
              <Card className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-sm">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="text-foreground">{formatCurrency(calculations.subtotal)}</span>
                  </div>
                  {calculations.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount:</span>
                      <span className="text-red-600 dark:text-red-400">-{formatCurrency(calculations.discountAmount)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total:</span>
                    <span className="text-[var(--accent-text)]">{formatCurrency(calculations.finalAmount)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </CustomDialog>

      {/* Product/Service Search Dialog */}
      {showItemSearch && (
        <CustomDialog
          open={showItemSearch}
          onOpenChange={setShowItemSearch}
          title="Add Items to Bill"
          description="Search and add products or services to the appointment bill"
          icon={<Search className="w-5 h-5" />}
          maxWidth="max-w-4xl"
          className="max-h-[85vh]"
        >
          <div className="space-y-4">
            {/* Search Controls */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${searchType}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[var(--input-background)] border-[var(--glass-border)]"
                />
              </div>
              <Select value={searchType} onValueChange={(value: 'products' | 'services') => setSearchType(value)}>
                <SelectTrigger className="w-32 bg-[var(--glass-bg)] border-[var(--glass-border)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="products">Products</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
              {searchType === 'products' ? (
                productsLoading ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <p className="text-sm">Loading products...</p>
                  </div>
                ) : productsError ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading products</p>
                    <p className="text-xs text-muted-foreground">{productsError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        if (companyId) {
                          dispatch(fetchCompanyProductsRequest({ companyId }));
                        }
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No products found{searchQuery ? ` matching "${searchQuery}"` : ''}</p>
                    {reduxCompanyProducts.length > 0 && (
                      <p className="text-xs mt-2">
                        {reduxCompanyProducts.length} product(s) available but may not be available for purchase
                      </p>
                    )}
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                  <Card key={product.id} className="p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                    <div onClick={() => selectProduct(product)}>
                      <div className="aspect-square mb-3 bg-muted rounded-lg overflow-hidden">
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <h4 className="font-medium text-foreground mb-1">{product.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[var(--accent-text)]">{formatCurrency(product.price)}</span>
                        <Badge variant="outline" className="text-xs">
                          {product.inStock} in stock
                        </Badge>
                      </div>
                    </div>
                  </Card>
                  ))
                )
              ) : (
                servicesLoading ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <p className="text-sm">Loading services...</p>
                  </div>
                ) : servicesError ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading services</p>
                    <p className="text-xs text-muted-foreground">{servicesError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        if (companyId) {
                          dispatch(fetchServicesRequest({ companyId }));
                        }
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No services found{searchQuery ? ` matching "${searchQuery}"` : ''}</p>
                  </div>
                ) : (
                  filteredServices.map((service) => (
                  <Card key={service.id} className="p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                    <div onClick={() => addService(service)}>
                      <div className="aspect-square mb-3 bg-muted rounded-lg overflow-hidden">
                        {service.image && (
                          <img 
                            src={service.image} 
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <h4 className="font-medium text-foreground mb-1">{service.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[var(--accent-text)]">{formatCurrency(service.price)}</span>
                        <Badge variant="outline" className="text-xs">
                          {service.duration} min
                        </Badge>
                      </div>
                    </div>
                  </Card>
                  ))
                )
              )}
            </div>
          </div>
        </CustomDialog>
      )}

      {/* Product Variant Selection Dialog */}
      {showVariantSelection && selectedProduct && (
        <CustomDialog
          open={showVariantSelection}
          onOpenChange={setShowVariantSelection}
          title={`Select ${selectedProduct.name} Variant`}
          description="Choose the specific variant you want to add to the bill"
          icon={<Package className="w-5 h-5" />}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedProduct.variants?.map((variant) => (
                <Card 
                  key={variant.id} 
                  className="p-4 hover:bg-accent/50 cursor-pointer transition-colors border-2 hover:border-[var(--accent-border)]"
                  onClick={() => handleVariantSelect(variant)}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-foreground">{variant.name}</h4>
                      <Badge variant={variant.isActive ? "default" : "secondary"} className="text-xs">
                        {variant.inStock} available
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      {Object.entries(variant.attributes).filter(([, value]) => value).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{key}:</span>
                          <span className="text-foreground font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="font-semibold text-[var(--accent-text)]">{formatCurrency(variant.price)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </CustomDialog>
      )}
    </>
  );
}