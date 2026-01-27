import { useState, useEffect, useMemo } from "react";
import { Search, Package, ShoppingCart, X, Trash2, Calculator, Check, User } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { useIsMobile } from "../../components/ui/use-mobile";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCompanyProductsRequest } from "../../store/slices/companyProductsSlice";
import { fetchAppointmentHistoryRequest } from "../../store/slices/appointmentHistorySlice";
import { CompanyProduct } from "../../services/companyProducts";
import { CompanyProductVariant } from "../../services/companyProductVariants";
import { companyProductVariantsService } from "../../services/companyProductVariants";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { salesService, CreateSaleData } from "../../services/sales";
import { formatAvatarUrl } from "../../utils";
import { UserSelector } from "../../components/common/UserSelector";
import { fetchUsersRequest } from "../../store/slices/usersSlice";
import { currenciesService, Currency } from "../../services/currencies";

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
  image?: string;
  price: number;
  inStock: number;
  hasVariants: boolean;
  variants?: ProductVariant[];
}

interface CartItem {
  id: string;
  type: "product";
  productId?: string; // Add productId to cart items
  name: string;
  description: string;
  image?: string; // Product image
  quantity: number;
  unitPrice: number;
  discount: number;
  unit?: string;
  variantId?: string;
  variantName?: string;
  variantVolume?: string;
  displayPrice?: number;
}

interface POSSalesPageProps {
  onBack?: () => void;
  currentUser?: any;
}

export const POSSalesPage = ({ onBack, currentUser }: POSSalesPageProps) => {
  const dispatch = useAppDispatch();
  const { companyProducts: reduxCompanyProducts, loading: productsLoading, error: productsError } = useAppSelector((state) => state.companyProducts);
  const { user } = useAppSelector((state) => state.auth);
  const { companies, currentCompany } = useAppSelector((state) => state.companies);
  const isMobile = useIsMobile();

  const companyId = user?.companyId || currentUser?.companyId;
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showVariantSelection, setShowVariantSelection] = useState(false);
  const [productVariantsMap, setProductVariantsMap] = useState<Record<string, CompanyProductVariant[]>>({});
  const [isCompleting, setIsCompleting] = useState(false);

  // User selection for direct sales
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showUserSelection, setShowUserSelection] = useState(false);

  // Get users from Redux
  const { users: allUsers } = useAppSelector((state) => state.users);

  // Show all users from the user table
  const users = useMemo(() => {
    return allUsers;
  }, [allUsers]);

  // Get selected customer details
  const selectedCustomer = useMemo(() => {
    return users.find(u => String(u.id) === String(selectedCustomerId)) || null;
  }, [users, selectedCustomerId]);

  // Fetch company currency
  useEffect(() => {
    const fetchCompanyCurrency = async () => {
      if (!companyId) {
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
        let company = companies.find(c => String(c.id) === String(companyId)) || currentCompany;
        
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
            const currencies = await currenciesService.getCurrencies();
            const usdCurrency = currencies.find(c => c.name === 'USD');
            setCompanyCurrency(usdCurrency || null);
          }
        } else {
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

  // Fetch products on mount
  useEffect(() => {
    if (companyId) {
      dispatch(fetchCompanyProductsRequest({ companyId }));
    }
  }, [dispatch, companyId]);

  // Fetch users for customer selection
  useEffect(() => {
    dispatch(fetchUsersRequest({}));
  }, [dispatch]);

  // Fetch variants for all products
  useEffect(() => {
    if (reduxCompanyProducts.length > 0) {
      const fetchAllVariants = async () => {
        const variantsMap: Record<string, CompanyProductVariant[]> = {};

        for (const product of reduxCompanyProducts) {
          try {
            const variants = await companyProductVariantsService.getVariantsByCompanyProductId(product.id);
            variantsMap[product.id] = variants;
          } catch (error) {
            console.error(`Error fetching variants for product ${product.id}:`, error);
            variantsMap[product.id] = [];
          }
        }

        setProductVariantsMap(variantsMap);
      };

      fetchAllVariants();
    }
  }, [reduxCompanyProducts]);

  // Map company products to Product interface
  // For POS, show ALL products that have variants with sell prices
  const companyProducts: Product[] = useMemo(() => {
    console.log('[POSSalesPage] Mapping products. Total redux products:', reduxCompanyProducts.length);
    console.log('[POSSalesPage] Product variants map keys:', Object.keys(productVariantsMap));

    const mapped = reduxCompanyProducts
      .map((product: CompanyProduct) => {
        const variants = productVariantsMap[product.id] || [];
        const activeVariants = variants.filter(v => v.isActive);

        console.log(`[POSSalesPage] Product ${product.name} (${product.id}):`, {
          totalVariants: variants.length,
          activeVariants: activeVariants.length
        });

        const mappedVariants: ProductVariant[] = activeVariants.map((variant: CompanyProductVariant) => {
          // Use active stock prices if available, otherwise default to 0
          const sellPrice = variant.activeStock?.sellPrice !== undefined && variant.activeStock.sellPrice !== null
            ? Number(variant.activeStock.sellPrice) || 0
            : 0;
          const costPrice = variant.activeStock?.costPrice !== undefined && variant.activeStock.costPrice !== null
            ? Number(variant.activeStock.costPrice) || 0
            : 0;
          const price = sellPrice > 0 ? sellPrice : costPrice;

          // Use active stock quantity if available
          const stockQuantity = variant.activeStock?.quantity !== undefined && variant.activeStock.quantity !== null
            ? Number(variant.activeStock.quantity) || 0
            : 0;

          return {
            id: variant.id,
            name: variant.name,
            sku: variant.sku,
            attributes: {
              ...(variant.color && { color: variant.color }),
              ...(variant.size && { size: variant.size }),
              ...(variant.weight && { weight: variant.weight }),
              ...(variant.material && { material: variant.material }),
            },
            price: price,
            inStock: stockQuantity,
            isActive: variant.isActive
          };
        });

        // Get the minimum price from variants that have active stock
        const defaultPrice = mappedVariants.length > 0
          ? (() => {
            const pricesWithStock = mappedVariants
              .filter(v => v.inStock > 0 && v.price > 0)
              .map(v => v.price);
            return pricesWithStock.length > 0 ? Math.min(...pricesWithStock) : 0;
          })()
          : 0;

        // Include products that have at least one variant with active stock and valid pricing
        const hasValidPricing = mappedVariants.length > 0
          ? mappedVariants.some(v => v.price > 0 && v.inStock > 0)
          : false;

        // Show products if:
        // 1. They have variants with valid pricing, OR
        // 2. Variants are still being loaded (productVariantsMap doesn't have this product yet)
        const isVariantsStillLoading = !productVariantsMap.hasOwnProperty(product.id);

        if (!isVariantsStillLoading && !hasValidPricing && mappedVariants.length === 0) {
          // Variants have been loaded but product has no variants with pricing
          console.log(`[POSSalesPage] Skipping product ${product.name} - no variants with valid pricing`);
          return null;
        }

        // Format image URL the same way as other product components
        const getImageUrl = () => {
          const url = product.imageUrl;
          if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
            return undefined;
          }
          // If it's already a full URL (starts with http), return as is
          // Otherwise, use formatAvatarUrl to add the host URL
          return url.startsWith('http') ? url : formatAvatarUrl(url);
        };

        return {
          id: product.id,
          name: product.name || 'Unnamed Product',
          description: product.description || '',
          image: getImageUrl(),
          price: defaultPrice,
          inStock: mappedVariants
            .filter(v => v.inStock > 0)
            .reduce((sum, v) => sum + v.inStock, 0),
          hasVariants: mappedVariants.length > 0,
          variants: mappedVariants.length > 0 ? mappedVariants : undefined
        };
      })
      .filter((product): product is Product => product !== null);

    console.log('[POSSalesPage] Final mapped products count:', mapped.length);
    return mapped;
  }, [reduxCompanyProducts, productVariantsMap]);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return companyProducts;

    const query = searchQuery.toLowerCase();
    return companyProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.variants?.some(v =>
        v.name.toLowerCase().includes(query) ||
        v.sku.toLowerCase().includes(query)
      )
    );
  }, [companyProducts, searchQuery]);

  // Format currency
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

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    const discountAmount = cartItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + (itemSubtotal * (item.discount / 100));
    }, 0);

    const finalAmount = subtotal - discountAmount;

    return {
      subtotal,
      discountAmount,
      finalAmount
    };
  }, [cartItems]);

  // Filter variants with stock for the selected product
  const variantsWithStock = useMemo(() => {
    if (!selectedProduct || !selectedProduct.variants) return [];
    return selectedProduct.variants.filter(v => v.inStock > 0);
  }, [selectedProduct]);

  // Select product
  const selectProduct = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      // Filter variants that have stock
      const variantsWithStock = product.variants.filter(v => v.inStock > 0);
      
      if (variantsWithStock.length === 0) {
        toast.error("This product has no variants with available stock.");
        return;
      }
      
      if (variantsWithStock.length === 1) {
        // Only one variant with stock - use it automatically
        addProductToCart(product, variantsWithStock[0]);
      } else {
        // Multiple variants with stock - show variant selection
        setSelectedProduct(product);
        setSelectedVariant(null);
        setShowVariantSelection(true);
      }
    } else if (product.price > 0) {
      // No variants but has a price, add directly to cart
      addProductToCart(product);
    } else {
      toast.error("This product has no variants or pricing information.");
    }
  };

  // Handle variant select
  const handleVariantSelect = (variant: ProductVariant) => {
    if (selectedProduct) {
      addProductToCart(selectedProduct, variant);
      setShowVariantSelection(false);
      setSelectedProduct(null);
      setSelectedVariant(null);
    }
  };

  // Add product to cart
  const addProductToCart = (product: Product, variant?: ProductVariant) => {
    const effectiveName = variant ? `${product.name} - ${variant.name}` : product.name;
    const effectiveDescription = variant
      ? `${product.description}${variant.attributes.size ? ` • Size: ${variant.attributes.size}` : ''}${variant.attributes.color ? ` • Color: ${variant.attributes.color}` : ''}`
      : product.description;
    const unitPrice = variant ? variant.price : product.price;
    const quantity = 1;
    const effectiveUnit = variant?.attributes?.volume || 'unit';

    // Format image URL properly
    const getImageUrl = () => {
      if (!product.image) return undefined;
      const url = product.image;
      if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
        return undefined;
      }
      // If it's already a full URL (starts with http), return as is
      // Otherwise, use formatAvatarUrl to add the host URL
      return url.startsWith('http') ? url : formatAvatarUrl(url);
    };

    const newItem: CartItem = {
      id: `product-${Date.now()}-${Math.random()}`,
      type: "product",
      productId: product.id, // Store productId
      name: effectiveName,
      description: effectiveDescription,
      image: getImageUrl(), // Store formatted product image
      quantity: quantity,
      unitPrice: unitPrice,
      discount: 0,
      unit: effectiveUnit,
      variantId: variant?.id,
      variantName: variant?.name,
      variantVolume: variant?.attributes?.volume,
      displayPrice: unitPrice
    };

    setCartItems(prev => [...prev, newItem]);
    toast.success(`${effectiveName} added to cart`);
  };

  // Remove item from cart
  const removeCartItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    toast.success("Item removed from cart");
  };

  // Update cart item
  const updateCartItem = (itemId: string, field: keyof CartItem, value: any) => {
    setCartItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  // Complete sale
  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      toast.error("Please add at least one item to the cart");
      return;
    }

    if (!companyId || !user?.id) {
      toast.error("Company ID or user ID is missing");
      return;
    }

    // Check if customer is selected
    if (!selectedCustomerId) {
      toast.error("Please select a customer before completing the sale");
      return;
    }

    setIsCompleting(true);
    try {
      // Validate that all product items have variantId (required by backend)
      const invalidItems = cartItems.filter(item => item.type === 'product' && !item.variantId);
      if (invalidItems.length > 0) {
        toast.error(`Some products are missing variant information. Please reselect them.`);
        setIsCompleting(false);
        return;
      }

      const saleData: CreateSaleData = {
        companyId: companyId,
        clientId: selectedCustomerId, // Selected customer (userId)
        amount: calculations.finalAmount,
        paymentMethod: 'Cash', // Default payment method
        paymentStatus: 'Paid',
        saleDate: new Date().toISOString().split('T')[0],
        items: cartItems.map(item => ({
          id: item.id,
          type: item.type,
          productId: item.productId, // Include productId (optional, backend gets from variant)
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          unit: item.unit,
          variantId: item.variantId, // Required for products
          variantName: item.variantName
        })),
        notes: null
      };

      console.log('[POSSalesPage] Creating sale with data:', {
        companyId: saleData.companyId,
        clientId: saleData.clientId,
        amount: saleData.amount,
        itemsCount: saleData.items.length,
        items: saleData.items.map(item => ({
          type: item.type,
          variantId: item.variantId,
          quantity: item.quantity
        }))
      });

      const createdSale = await salesService.createSale(saleData);

      console.log('[POSSalesPage] Sale created successfully:', createdSale);

      toast.success("Sale completed successfully!");

      // Clear cart and selected customer
      setCartItems([]);
      setSelectedCustomerId(null);

      // Refresh sales list to show the new sale immediately
      if (companyId) {
        // Calculate date range (same as SalesPage default: 7 days)
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        const dateFrom = sevenDaysAgo.toISOString().split('T')[0];
        const dateTo = today.toISOString().split('T')[0];

        // Small delay to ensure backend has processed the sale
        setTimeout(() => {
          dispatch(fetchAppointmentHistoryRequest({
            companyId,
            limit: 1000,
            dateFrom,
            dateTo,
            enrich: true // Enrich with product/service details
          }));
        }, 500);
      }

      // Navigate back if callback provided
      if (onBack) {
        onBack();
      }
    } catch (error: any) {
      console.error('Error creating sale:', error);
      toast.error(error.response?.data?.message || error.message || "Failed to complete sale. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Point of Sale</h1>
          <p className="text-sm text-muted-foreground">Sell products to customers</p>
        </div>
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="border-[var(--accent-border)] text-foreground hover:bg-[var(--accent-bg)]"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex gap-6 ${isMobile ? 'flex-col' : 'flex-row'}`}>
        {/* Left Panel - Product Selection */}
        <Card className={`${isMobile ? 'w-full' : 'flex-1 min-w-0'} flex flex-col backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]`}>
          {/* Header with Search Bar */}
          <div className="flex-shrink-0 p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-5 h-5 text-[var(--accent-text)]" />
              <h3 className="font-medium text-foreground">Products</h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 lg:px-6 pb-4 lg:pb-6">
            {productsLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Loading products...</p>
              </div>
            ) : productsError ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-red-600 dark:text-red-400 mb-2">Error loading products</p>
                <p className="text-xs text-muted-foreground mb-4">{productsError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (companyId) {
                      dispatch(fetchCompanyProductsRequest({ companyId }));
                    }
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 auto-rows-max">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/30 flex items-center justify-center">
                      <Package className="w-12 h-12 text-muted-foreground opacity-60" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {searchQuery ? "No products found" : "No products available"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md">
                      {searchQuery
                        ? `We couldn't find any products matching "${searchQuery}". Try adjusting your search terms.`
                        : "You don't have any products available for sale. Add products to your inventory first."}
                    </p>
                    {searchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        className="mt-2"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="p-4 hover:bg-accent/50 cursor-pointer transition-all duration-200 hover:shadow-md border-[var(--glass-border)]"
                      onClick={() => selectProduct(product)}
                    >
                      <div className="aspect-square mb-3 bg-muted rounded-lg overflow-hidden relative">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full flex items-center justify-center ${product.image ? 'hidden' : ''}`}
                          style={{ display: product.image ? 'none' : 'flex' }}
                        >
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </div>
                      <h4 className="font-medium text-foreground text-sm mb-2 truncate" title={product.name}>{product.name}</h4>
                      <div className="flex flex-col gap-2">
                        <span className="font-semibold text-[var(--accent-text)] text-base">
                          {formatCurrency(product.price)}
                        </span>
                        <Badge variant="outline" className="text-xs w-fit">
                          {product.inStock} in stock
                        </Badge>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Right Panel - Cart */}
        <Card
          className={`${isMobile ? 'w-full' : 'flex-shrink-0'} flex flex-col backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]`}
          style={!isMobile ? { width: '650px', minWidth: '650px', maxWidth: '650px' } : undefined}
        >
          {/* Cart Header */}
          <div className="flex-shrink-0 p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCart className="w-5 h-5 text-[var(--accent-text)]" />
              <h3 className="font-medium text-foreground">Cart</h3>
              {cartItems.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {cartItems.length}
                </Badge>
              )}
            </div>
            {/* Customer Selection in Header */}
            <div>
              {selectedCustomer ? (
                <Card className="p-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedCustomer.avatar ? (
                        <img
                          src={formatAvatarUrl(selectedCustomer.avatar)}
                          alt={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-bg)] flex items-center justify-center">
                          <User className="w-4 h-4 text-[var(--accent-text)]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {selectedCustomer.firstName} {selectedCustomer.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{selectedCustomer.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUserSelection(true)}
                      className="h-8 px-2 text-xs"
                    >
                      Change
                    </Button>
                  </div>
                </Card>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUserSelection(true)}
                  className="w-full h-9 text-sm bg-[var(--input-background)] border-[var(--glass-border)] hover:border-[var(--accent-border)]"
                >
                  <User className="w-4 h-4 mr-2" />
                  Select Customer
                </Button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">Cart is empty</p>
                <p className="text-xs text-muted-foreground mt-1">Add products from the left panel</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <Card key={item.id} className="p-4 bg-[var(--glass-bg)] border border-[var(--accent-border)] backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 hover:border-[var(--accent-primary)]">
                    <div className="space-y-3">
                      {/* Header Section */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Product Image */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  img.style.display = 'none';
                                  const fallback = img.nextElementSibling as HTMLElement;
                                  if (fallback) {
                                    fallback.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ display: item.image ? 'none' : 'flex' }}
                            >
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground text-sm truncate mb-1">{item.name}</h4>
                            {item.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                            )}
                            {item.variantVolume && (
                              <Badge variant="outline" className="text-xs bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent-text)] mt-1">
                                Size: {item.variantVolume}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCartItem(item.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 h-7 w-7"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>

                        </div>
                      </div>

                      {/* Input Fields Section */}
                      <div className="flex flex-row gap-2 items-end">
                        <div className="flex-1 space-y-1 min-w-0">
                          <Label className="text-xs font-medium text-muted-foreground">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateCartItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                            className="text-xs h-8 w-full bg-[var(--input-background)] border-[var(--glass-border)] hover:border-[var(--accent-border)] focus:border-[var(--accent-primary)] transition-colors"
                          />
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <Label className="text-xs font-medium text-muted-foreground">
                            {item.variantVolume && item.displayPrice
                              ? `Price/${item.variantVolume}`
                              : `Price${item.unit ? `/${item.unit}` : ''}`
                            }
                          </Label>
                          <div className="text-xs font-semibold text-[var(--accent-text)] h-8 flex items-center w-full">
                            {item.variantVolume && item.displayPrice
                              ? formatCurrency(item.displayPrice)
                              : formatCurrency(item.unitPrice)
                            }
                          </div>
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <Label className="text-xs font-medium text-muted-foreground">Discount %</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) => updateCartItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            className="text-xs h-8 w-full bg-[var(--input-background)] border-[var(--glass-border)] hover:border-[var(--accent-border)] focus:border-[var(--accent-primary)] transition-colors"
                          />
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <Label className="text-xs font-medium text-muted-foreground">Total</Label>
                          <div className="text-sm font-bold text-[var(--accent-text)] h-8 flex items-center justify-end w-full">
                            {formatCurrency((item.quantity * item.unitPrice) * (1 - item.discount / 100))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <div className="flex-shrink-0 p-4 lg:p-6 pt-0">
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

            <Button
              onClick={handleCompleteSale}
              disabled={cartItems.length === 0 || isCompleting || !selectedCustomerId}
              className="w-full mt-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompleting ? (
                <>
                  <Calculator className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Complete Sale
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* User Selection Dialog */}
      <CustomDialog
        open={showUserSelection}
        onOpenChange={setShowUserSelection}
        title="Select Customer"
        description="Choose the customer for this sale"
        icon={<User className="w-5 h-5" />}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 pb-6">
          <UserSelector
            value={selectedCustomerId}
            onChange={(userId) => {
              setSelectedCustomerId(userId);
              if (userId) {
                setShowUserSelection(false);
              }
            }}
            users={users}
            placeholder="Select a customer"
            allowClear={true}
            error={false}
          />
        </div>
      </CustomDialog>

      {/* Variant Selection Dialog */}
      {showVariantSelection && selectedProduct && (
        <CustomDialog
          open={showVariantSelection}
          onOpenChange={setShowVariantSelection}
          title={`Select ${selectedProduct.name} Variant`}
          description="Choose the specific variant you want to add to the cart"
          icon={<Package className="w-5 h-5" />}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {variantsWithStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  No variants with available stock for this product.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {variantsWithStock.map((variant) => (
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
            )}
          </div>
        </CustomDialog>
      )}
    </div>
  );
};

