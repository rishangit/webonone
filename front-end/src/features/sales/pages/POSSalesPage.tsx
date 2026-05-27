import { useState, useEffect, useMemo } from "react";
import { Search, Package, ShoppingCart, X, Calculator, Check, User, CreditCard, Save } from "lucide-react";
import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/components/ui/use-mobile";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCompanyProductsRequest } from "@/shared/store/products-company";
import type { CompanyProduct, CompanyProductVariant } from "@/shared/types/products-company";
import { companyProductVariantsService } from "@/shared/services/products-company-public";
import { fetchAppointmentHistoryRequest } from "@/shared/store/appointments";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { salesService, CreateSaleData } from "@/features/sales/services";
import { formatAvatarUrl } from "@/shared/utils";
import { UserSelectionDialog } from "@/components/common/UserSelectionDialog";
import { fetchUsersRequest } from "@/shared/store/users";
import { currenciesService, Currency } from "@/shared/services/currencies";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartItemEditorCard } from "@/components/common/CartItemEditorCard";

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
  productId?: string;
  name: string;
  description: string;
  image?: string;
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

const getStockAvailabilityBadgeClass = (stock: number) => {
  if (stock <= 0) {
    return "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30";
  }
  if (stock < 10) {
    return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
  }
  return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
};

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
  const [showVariantSelection, setShowVariantSelection] = useState(false);
  const [productVariantsMap, setProductVariantsMap] = useState<Record<string, CompanyProductVariant[]>>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompleteSaleDialog, setShowCompleteSaleDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [cashReceived, setCashReceived] = useState("");

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showUserSelection, setShowUserSelection] = useState(false);

  const { users: allUsers } = useAppSelector((state) => state.users);

  const users = useMemo(() => {
    return allUsers;
  }, [allUsers]);

  const selectedCustomer = useMemo(() => {
    return users.find(u => String(u.id) === String(selectedCustomerId)) || null;
  }, [users, selectedCustomerId]);

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
            const { companiesService } = await import("@/shared/services/companies-public");
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

  useEffect(() => {
    if (companyId) {
      dispatch(fetchCompanyProductsRequest({ companyId }));
    }
  }, [dispatch, companyId]);

  useEffect(() => {
    dispatch(fetchUsersRequest({}));
  }, [dispatch]);

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

  const companyProducts = useMemo<Product[]>(() => {
    const mapped = reduxCompanyProducts.flatMap((product: CompanyProduct) => {
      const variants = productVariantsMap[product.id] || [];
      const activeVariants = variants.filter(v => v.isActive);

      const mappedVariants: ProductVariant[] = activeVariants.map((variant: CompanyProductVariant) => {
        const sellPrice = variant.activeStock?.sellPrice !== undefined && variant.activeStock.sellPrice !== null
          ? Number(variant.activeStock.sellPrice) || 0
          : 0;
        const costPrice = variant.activeStock?.costPrice !== undefined && variant.activeStock.costPrice !== null
          ? Number(variant.activeStock.costPrice) || 0
          : 0;
        const price = sellPrice > 0 ? sellPrice : costPrice;

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
          price,
          inStock: stockQuantity,
          isActive: variant.isActive
        };
      });

      const defaultPrice = mappedVariants.length > 0
        ? (() => {
          const pricesWithStock = mappedVariants
            .filter(v => v.inStock > 0 && v.price > 0)
            .map(v => v.price);
          return pricesWithStock.length > 0 ? Math.min(...pricesWithStock) : 0;
        })()
        : 0;

      const hasValidPricing = mappedVariants.length > 0
        ? mappedVariants.some(v => v.price > 0 && v.inStock > 0)
        : false;

      const isVariantsStillLoading = !Object.prototype.hasOwnProperty.call(productVariantsMap, product.id);

      if (!isVariantsStillLoading && !hasValidPricing && mappedVariants.length === 0) {
        return [];
      }

      const getImageUrl = () => {
        const url = product.imageUrl;
        if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
          return undefined;
        }
        return url.startsWith('http') ? url : formatAvatarUrl(url);
      };

      const imageUrl = getImageUrl();

      return [{
        id: product.id,
        name: product.name || 'Unnamed Product',
        description: product.description || '',
        ...(imageUrl ? { image: imageUrl } : {}),
        price: defaultPrice,
        inStock: mappedVariants
          .filter(v => v.inStock > 0)
          .reduce((sum, v) => sum + v.inStock, 0),
        hasVariants: mappedVariants.length > 0,
        variants: mappedVariants.length > 0 ? mappedVariants : undefined
      }];
    });

    return mapped;
  }, [reduxCompanyProducts, productVariantsMap]);

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

  const variantsWithStock = useMemo(() => {
    if (!selectedProduct || !selectedProduct.variants) return [];
    return selectedProduct.variants.filter(v => v.inStock > 0);
  }, [selectedProduct]);

  const selectProduct = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      const variantsWithStock = product.variants.filter(v => v.inStock > 0);

      if (variantsWithStock.length === 0) {
        toast.error("This product has no variants with available stock.");
        return;
      }

      if (variantsWithStock.length === 1) {
        addProductToCart(product, variantsWithStock[0]);
      } else {
        setSelectedProduct(product);
        setShowVariantSelection(true);
      }
    } else if (product.price > 0) {
      addProductToCart(product);
    } else {
      toast.error("This product has no variants or pricing information.");
    }
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    if (selectedProduct) {
      addProductToCart(selectedProduct, variant);
      setShowVariantSelection(false);
      setSelectedProduct(null);
    }
  };

  const addProductToCart = (product: Product, variant?: ProductVariant) => {
    const effectiveName = variant ? `${product.name} - ${variant.name}` : product.name;
    const effectiveDescription = variant
      ? `${product.description}${variant.attributes.size ? ` • Size: ${variant.attributes.size}` : ''}${variant.attributes.color ? ` • Color: ${variant.attributes.color}` : ''}`
      : product.description;
    const unitPrice = variant ? variant.price : product.price;
    const quantity = 1;
    const effectiveUnit = variant?.attributes?.volume || 'unit';

    const getImageUrl = () => {
      if (!product.image) return undefined;
      const url = product.image;
      if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
        return undefined;
      }
      return url.startsWith('http') ? url : formatAvatarUrl(url);
    };

    const newItem: CartItem = {
      id: `product-${Date.now()}-${Math.random()}`,
      type: "product",
      productId: product.id,
      name: effectiveName,
      description: effectiveDescription,
      image: getImageUrl(),
      quantity,
      unitPrice,
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

  const removeCartItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    toast.success("Item removed from cart");
  };

  const updateCartItem = (itemId: string, field: keyof CartItem, value: any) => {
    setCartItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const cashReceivedAmount = useMemo(() => {
    const amount = Number(cashReceived);
    return Number.isFinite(amount) ? amount : 0;
  }, [cashReceived]);

  const cashChangeAmount = useMemo(() => {
    return Math.max(0, cashReceivedAmount - calculations.finalAmount);
  }, [cashReceivedAmount, calculations.finalAmount]);

  const isCashInsufficient = paymentMethod === "cash" && cashReceivedAmount < calculations.finalAmount;

  const handleOpenCompleteSaleDialog = () => {
    if (cartItems.length === 0) {
      toast.error("Please add at least one item to the cart");
      return;
    }

    if (!companyId || !user?.id) {
      toast.error("Company ID or user ID is missing");
      return;
    }

    if (!selectedCustomerId) {
      toast.error("Please select a customer before completing the sale");
      return;
    }
    setPaymentMethod("card");
    setCashReceived("");
    setShowCompleteSaleDialog(true);
  };

  const handleCompleteSale = async () => {
    if (paymentMethod === "cash" && cashReceivedAmount < calculations.finalAmount) {
      toast.error("Cash received must be greater than or equal to the total amount");
      return;
    }
    if (!companyId || !user?.id || !selectedCustomerId) {
      toast.error("Company, user, or customer information is missing");
      return;
    }
    const customerId = selectedCustomerId;

    setIsCompleting(true);
    try {
      const invalidItems = cartItems.filter(item => item.type === 'product' && !item.variantId);
      if (invalidItems.length > 0) {
        toast.error("Some products are missing variant information. Please reselect them.");
        setIsCompleting(false);
        return;
      }

      const saleData: CreateSaleData = {
        companyId,
        clientId: customerId,
        amount: calculations.finalAmount,
        paymentMethod: paymentMethod === "cash" ? "Cash" : "Card",
        paymentStatus: 'Paid',
        saleDate: new Date().toISOString().split('T')[0],
        items: cartItems.map(item => ({
          id: item.id,
          type: item.type,
          productId: item.productId,
          name: item.name,
          description: item.description && item.description.trim() ? item.description : undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          unit: item.unit,
          variantId: item.variantId,
          variantName: item.variantName
        })),
        notes: null
      };

      await salesService.createSale(saleData);

      toast.success("Sale completed successfully!");
      setShowCompleteSaleDialog(false);
      setCartItems([]);
      setSelectedCustomerId(null);

      if (companyId) {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        const dateFrom = sevenDaysAgo.toISOString().split('T')[0];
        const dateTo = today.toISOString().split('T')[0];

        setTimeout(() => {
          dispatch(fetchAppointmentHistoryRequest({
            companyId,
            limit: 1000,
            dateFrom,
            dateTo,
            enrich: true
          }));
        }, 500);
      }

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
    <div className="flex-1 h-full min-h-0 space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Point of Sale</h1>
          <p className="text-sm text-muted-foreground">Sell products to customers</p>
        </div>
        {onBack && <BackButton onClick={onBack} label="Back" />}
      </div>

      <div className={`flex gap-6 ${isMobile ? 'flex-col' : 'flex-row'} ${isMobile ? '' : 'flex-1 min-h-0'}`}>
        <Card className={`${isMobile ? 'w-full' : 'flex-1 min-w-0 h-full min-h-0'} flex flex-col backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]`}>
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
                        <Badge className={`text-xs w-fit ${getStockAvailabilityBadgeClass(product.inStock)}`}>
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

        <Card
          className={`${isMobile ? 'w-full' : 'flex-shrink-0 h-full min-h-0'} flex flex-col backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]`}
          style={!isMobile ? { width: '30%' } : undefined}
        >
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

          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 lg:px-6 pb-3">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">Cart is empty</p>
                <p className="text-xs text-muted-foreground mt-1">Add products from the left panel</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <CartItemEditorCard
                    key={item.id}
                    id={item.id}
                    type="product"
                    name={item.name}
                    description={item.description}
                    image={item.image}
                    quantity={item.quantity}
                    unitPrice={item.unitPrice}
                    discount={item.discount}
                    unit={item.unit}
                    variantVolume={item.variantVolume}
                    displayPrice={item.displayPrice}
                    formatCurrency={formatCurrency}
                    onRemove={removeCartItem}
                    onQuantityChange={(itemId, quantity) => updateCartItem(itemId, "quantity", quantity)}
                    onDiscountChange={(itemId, discount) => updateCartItem(itemId, "discount", discount)}
                    quantityMin={0}
                  />
                ))}
              </div>
            )}
          </div>

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
              onClick={handleOpenCompleteSaleDialog}
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

      <CustomDialog
        open={showCompleteSaleDialog}
        onOpenChange={setShowCompleteSaleDialog}
        title="Complete Sale"
        description="Review totals and confirm the payment method before finalizing."
        icon={<CreditCard className="w-5 h-5" />}
        sizeWidth="small"
        sizeHeight="large"
        footer={
          <>
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowCompleteSaleDialog(false)}
              disabled={isCompleting}
              className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              size="default"
              onClick={handleCompleteSale}
              disabled={isCompleting || isCashInsufficient}
            >
              <Save className="w-4 h-4 mr-2" />
              {isCompleting ? "Processing..." : "Complete Sale"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Card className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatCurrency(calculations.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-red-600 dark:text-red-400">-{formatCurrency(calculations.discountAmount)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-[var(--accent-text)]">{formatCurrency(calculations.finalAmount)}</span>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <Label className="text-foreground">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "card" | "cash")}>
              <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Card Payment</SelectItem>
                <SelectItem value="cash">Cash Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "cash" && (
            <Card className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="cash-received" className="text-foreground">
                    Cash Received
                  </Label>
                  <Input
                    id="cash-received"
                    type="number"
                    min="0"
                    step="0.01"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="Enter amount received"
                    className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Received</span>
                  <span className="text-foreground">{formatCurrency(cashReceivedAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Change to Return</span>
                  <span className="font-semibold text-[var(--accent-text)]">{formatCurrency(cashChangeAmount)}</span>
                </div>
                {isCashInsufficient && (
                  <p className="text-sm text-destructive">
                    Cash received is less than the total amount.
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      </CustomDialog>

      <UserSelectionDialog
        open={showUserSelection}
        onOpenChange={setShowUserSelection}
        value={selectedCustomerId}
        onChange={setSelectedCustomerId}
        users={users}
        title="Select Customer"
        description="Choose the customer for this sale"
        placeholder="Search customer by name or email"
        error={false}
      />

      {showVariantSelection && selectedProduct && (
        <CustomDialog
          open={showVariantSelection}
          onOpenChange={setShowVariantSelection}
          title={`Select ${selectedProduct.name} Variant`}
          description="Choose the specific variant you want to add to the cart"
          icon={<Package className="w-5 h-5" />}
          sizeWidth="small"
          sizeHeight="large"
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
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">{variant.name}</h4>
                        <Badge className={`text-xs w-fit ${getStockAvailabilityBadgeClass(variant.inStock)}`}>
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
