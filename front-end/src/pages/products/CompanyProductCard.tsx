import { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Package, DollarSign, TrendingUp, MoreVertical, Trash2, Eye, AlertTriangle, CheckCircle, Image as ImageIcon } from "lucide-react";
import { CompanyProduct } from "../../services/companyProducts";
import { CompanyProductVariant } from "../../services/companyProductVariants";
import { companyProductVariantsService } from "../../services/companyProductVariants";
import { formatAvatarUrl } from "../../utils";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { currenciesService, Currency } from "../../services/currencies";
import { fetchCompanyRequest } from "../../store/slices/companiesSlice";
import { companiesService } from "../../services/companies";

interface CompanyProductCardProps {
  product: CompanyProduct;
  viewMode: "grid" | "list";
  onDelete?: (product: CompanyProduct) => void;
  onView?: (product: CompanyProduct) => void;
  onViewVariant?: (variant: CompanyProductVariant) => void;
  onEditVariant?: (variant: CompanyProductVariant) => void;
  onDeleteVariant?: (variant: CompanyProductVariant) => void;
}

export const CompanyProductCard = ({ 
  product, 
  viewMode, 
  onDelete, 
  onView
}: CompanyProductCardProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { companies, currentCompany } = useAppSelector((state) => state.companies);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [variants, setVariants] = useState<CompanyProductVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);
  
  // Get company ID from product (preferred) or user
  const companyId = product.companyId || user?.companyId;

  // Get image URL - use system product imageUrl or fallback
  // Format the URL the same way as system products (add host URL if needed)
  const getImageUrl = () => {
    if (imageError) return null;
    const url = product.imageUrl;
    // Check if URL is valid
    if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
      return null;
    }
    // If it's already a full URL (starts with http), return as is
    // Otherwise, use formatAvatarUrl to add the host URL (same as system products)
    return url.startsWith('http') ? url : formatAvatarUrl(url);
  };

  const imageUrl = getImageUrl();

  // Get company currency - use product's companyId
  useEffect(() => {
    const fetchCompanyCurrency = async () => {
      if (!companyId) {
        // Try to get USD as default if no company ID
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
        // Find company from Redux store first
        let company = companies.find(c => String(c.id) === String(companyId));
        
        // If company not found in Redux, fetch it directly via API
        if (!company) {
          try {
            console.log('CompanyProductCard: Company not in Redux, fetching via API for', companyId);
            company = await companiesService.getCompanyById(String(companyId));
            // Also dispatch to Redux for future use
            dispatch(fetchCompanyRequest(String(companyId)));
          } catch (fetchError) {
            console.error('Error fetching company:', fetchError);
          }
        }
        
        const currencyId = company?.currencyId;
        
        console.log('CompanyProductCard: Company found:', company?.name, 'currencyId:', currencyId, 'companyId:', companyId);
        
        if (currencyId) {
          try {
            const currency = await currenciesService.getCurrency(currencyId);
            setCompanyCurrency(currency);
            console.log('CompanyProductCard: Loaded currency', currency.name, currency.symbol, 'for company', companyId);
          } catch (currencyError) {
            console.error('Error fetching currency by ID:', currencyError);
            // Fallback to USD
            const currencies = await currenciesService.getCurrencies();
            const usdCurrency = currencies.find(c => c.name === 'USD');
            setCompanyCurrency(usdCurrency || null);
          }
        } else {
          // If no currency is set, fetch USD as default
          try {
            const currencies = await currenciesService.getCurrencies();
            const usdCurrency = currencies.find(c => c.name === 'USD');
            setCompanyCurrency(usdCurrency || null);
            console.log('CompanyProductCard: No currency set for company', companyId, '- using USD');
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
  }, [companyId, companies, dispatch, product.companyId]);

  const formatPrice = (price: number | undefined | null) => {
    const numPrice = Number(price) || 0;
    
    // Always use company currency (or USD default if no currency is set)
    if (companyCurrency) {
      const decimals = companyCurrency.decimals || 2;
      
      if (isNaN(numPrice)) {
        return `${companyCurrency.symbol} ${(0).toFixed(decimals)}`;
      }
      
      // Round the price according to currency rounding
      const roundedPrice = Math.round(numPrice / companyCurrency.rounding) * companyCurrency.rounding;
      
      // Format with currency symbol directly (more reliable than Intl.NumberFormat for custom currencies)
      // Use number formatting for thousands separators
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
  };

  const getStockStatus = () => {
    // Calculate aggregated stock from active stock entries
    const totalStock = variants.reduce((sum, v) => sum + (v.activeStock?.quantity || 0), 0);
    
    if (variants.length === 0) return { status: 'Unknown', color: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30' };
    if (totalStock === 0) return { status: 'Out of Stock', color: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30' };
    if (totalStock < 10) return { status: 'Low Stock', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' };
    return { status: 'In Stock', color: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30' };
  };

  const stockStatus = getStockStatus();
  
  // Fetch variants when component mounts or product changes
  useEffect(() => {
    const fetchVariants = async () => {
      if (!product.id) return;
      try {
        const fetchedVariants = await companyProductVariantsService.getVariantsByCompanyProductId(product.id);
        setVariants(fetchedVariants);
        
        // Set default variant as selected
        const defaultVariant = fetchedVariants.find(v => v.isDefault);
        if (defaultVariant) {
          setSelectedVariantId(defaultVariant.id);
        } else if (fetchedVariants.length > 0) {
          // If no default variant, select the first one
          setSelectedVariantId(fetchedVariants[0].id);
        }
      } catch (error) {
        console.error('Error fetching variants:', error);
      }
    };
    fetchVariants();
  }, [product.id]);

  // Refresh variant data when selected variant changes to get latest stock/price info
  useEffect(() => {
    const refreshVariantData = async () => {
      if (!selectedVariantId || !product.id) return;
      try {
        // Fetch fresh variant data with active stock
        const refreshedVariant = await companyProductVariantsService.getVariantById(selectedVariantId);
        
        // Update the variant in the variants array
        setVariants(prevVariants => 
          prevVariants.map(v => v.id === selectedVariantId ? refreshedVariant : v)
        );
      } catch (error) {
        console.error('Error refreshing variant data:', error);
      }
    };
    
    if (selectedVariantId) {
      refreshVariantData();
    }
  }, [selectedVariantId, product.id]);

  // Get the currently selected variant
  const selectedVariant = variants.find(v => v.id === selectedVariantId) || null;
  
  // Calculate aggregated price and margin from variants (using active stock)
  const aggregatedCostPrice = variants.length > 0 
    ? (() => {
        const variantsWithCost = variants.filter(v => v.activeStock?.costPrice !== undefined && v.activeStock?.costPrice !== null);
        if (variantsWithCost.length === 0) return 0;
        const sum = variantsWithCost.reduce((sum, v) => sum + (Number(v.activeStock?.costPrice) || 0), 0);
        return sum / variantsWithCost.length;
      })()
    : 0;
  const aggregatedSellPrice = variants.length > 0
    ? (() => {
        const variantsWithSell = variants.filter(v => v.activeStock?.sellPrice !== undefined && v.activeStock?.sellPrice !== null);
        if (variantsWithSell.length === 0) return undefined;
        const sum = variantsWithSell.reduce((sum, v) => sum + (Number(v.activeStock?.sellPrice) || 0), 0);
        return sum / variantsWithSell.length;
      })()
    : undefined;
  
  // Calculate aggregated stock from active stock entries
  const aggregatedStock = variants.reduce((sum, v) => sum + (Number(v.activeStock?.quantity) || 0), 0);
  
  // Use selected variant's active stock data if available, otherwise show 0
  // Always prioritize active stock prices from the selected variant
  const displayCostPrice = selectedVariant?.activeStock?.costPrice !== undefined && selectedVariant.activeStock.costPrice !== null
    ? (() => {
        const price = Number(selectedVariant.activeStock.costPrice);
        return isNaN(price) ? 0 : price;
      })()
    : 0;
  const displaySellPrice = selectedVariant?.activeStock?.sellPrice !== undefined && selectedVariant.activeStock.sellPrice !== null
    ? (() => {
        const price = Number(selectedVariant.activeStock.sellPrice);
        return isNaN(price) ? 0 : price;
      })()
    : 0;
  const displayCurrentStock = selectedVariant?.activeStock?.quantity !== undefined && selectedVariant.activeStock.quantity !== null
    ? (() => {
        const stock = Number(selectedVariant.activeStock.quantity);
        return isNaN(stock) ? 0 : stock;
      })()
    : 0;
  const displayMinStock = selectedVariant?.minStock !== undefined ? selectedVariant.minStock : 0;
  const displayMaxStock = selectedVariant?.maxStock !== undefined ? selectedVariant.maxStock : 0;
  const displayStockUnit = 'units'; // Stock unit is now managed per stock entry
  
  // Get availability status from selected variant
  const getAvailabilityStatus = () => {
    if (!selectedVariant) {
      // Fallback to product availability if no variant selected
      return {
        isAvailable: product.isAvailableForPurchase,
        type: 'service' as 'sell' | 'service' | 'both',
        text: product.isAvailableForPurchase ? 'Available' : 'Unavailable'
      };
    }
    
    if (!selectedVariant.isActive) {
      return {
        isAvailable: false,
        type: selectedVariant.type || 'service',
        text: 'Unavailable'
      };
    }
    
    const type = selectedVariant.type || 'service';
    let text = 'Available';
    
    if (type === 'sell') {
      text = 'Available: For Sale Only';
    } else if (type === 'service') {
      text = 'Available: Service Use Only';
    } else if (type === 'both') {
      text = 'Available: For Sale and Service Use';
    }
    
    return {
      isAvailable: true,
      type: type,
      text: text
    };
  };
  
  const availabilityStatus = getAvailabilityStatus();
  
  // Calculate margin for selected variant
  const displayMargin = displaySellPrice > 0 && displayCostPrice > 0
    ? (() => {
        const sell = Number(displaySellPrice) || 0;
        const cost = Number(displayCostPrice) || 0;
        if (cost === 0 || isNaN(sell) || isNaN(cost)) return null;
        const margin = ((sell - cost) / cost * 100);
        return isNaN(margin) ? null : margin.toFixed(1);
      })()
    : null;
  
  // Stock status for selected variant
  const getSelectedVariantStockStatus = () => {
    if (!selectedVariant) return stockStatus;
    const stock = selectedVariant.activeStock?.quantity || 0;
    if (stock === 0) return { status: 'Out of Stock', color: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30' };
    if (stock < 10) return { status: 'Low Stock', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' };
    return { status: 'In Stock', color: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30' };
  };
  
  const selectedStockStatus = getSelectedVariantStockStatus();


  // List View
  if (viewMode === "list") {
    return (
      <Card 
        className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)] cursor-pointer"
        onClick={() => onView?.(product)}
      >
        <div className="flex items-start gap-4 mb-4">
          {/* Product Image */}
          <div className="flex-shrink-0 relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 w-20 h-16 flex items-center justify-center">
            {imageLoading && imageUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              </div>
            )}
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={product.name || 'Product'}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoading(false)}
                onError={(e) => {
                  setImageError(true);
                  setImageLoading(false);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                style={{ display: imageLoading ? 'none' : 'block' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}
            <div className="absolute top-1 right-1">
              <Badge className={`${selectedStockStatus.color} text-xs border`}>
                {selectedStockStatus.status === 'In Stock' ? "✓" : selectedStockStatus.status === 'Low Stock' ? "!" : "×"}
              </Badge>
            </div>
          </div>
          
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1 mr-2">
                <h3 className="font-medium text-foreground text-base sm:text-lg truncate">{product.name || 'Unknown Product'}</h3>
                {product.description && (
                  <p className="text-muted-foreground text-sm line-clamp-1">{product.description}</p>
                )}
                {product.sku && (
                  <p className="text-muted-foreground text-xs">SKU: {product.sku}</p>
                )}
                {/* Variant Selector */}
                {variants.length > 1 && (
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <Label className="text-xs text-muted-foreground mb-1 block">Variant</Label>
                    <Select 
                      value={selectedVariantId || ''} 
                      onValueChange={(value) => setSelectedVariantId(value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {variants.map((variant) => (
                          <SelectItem 
                            key={variant.id} 
                            value={variant.id}
                          >
                            {variant.name}
                            {variant.isDefault && ' (Default)'}
                            {variant.color && ` - ${variant.color}`}
                            {variant.size && ` (${variant.size})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {variants.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {variants.length} {variants.length === 1 ? 'variant' : 'variants'}
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-accent text-muted-foreground hover:text-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover border-border" align="end">
                    {onView && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(product); }} className="text-popover-foreground hover:bg-sidebar-accent">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(product); }} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Company-specific data - From selected variant or aggregated */}
            {variants.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-foreground">
                        {displayCurrentStock}
                      </div>
                      <div className="text-xs">{displayStockUnit}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-foreground">{formatPrice(displayCostPrice)}</div>
                      <div className="text-xs">{selectedVariant ? 'Cost' : 'Avg Cost'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-foreground">{formatPrice(displaySellPrice)}</div>
                      <div className="text-xs">{selectedVariant ? 'Sell' : 'Avg Sell'}</div>
                    </div>
                  </div>
                  {displayMargin && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-green-600 dark:text-green-400">{displayMargin}%</div>
                        <div className="text-xs">Margin</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stock Range - From selected variant */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{selectedVariant ? 'Stock Range' : 'Total Stock Range'}</span>
                <span>
                  {displayCurrentStock} {displayStockUnit}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-[var(--accent-primary)] h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, displayCurrentStock > 0 ? 100 : 0)}%` 
                  }}
                />
              </div>
                </div>
              </>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {product.tags.slice(0, 3).map((tag, index) => {
                  const tagObj = typeof tag === 'string' 
                    ? { id: index.toString(), name: tag, color: '#3B82F6', icon: undefined }
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
            )}

            {/* Availability */}
            <div className="flex items-center justify-between">
              <Badge className={availabilityStatus.isAvailable ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                {availabilityStatus.isAvailable ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {availabilityStatus.text}
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {availabilityStatus.text}
                  </>
                )}
              </Badge>
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
      onClick={() => onView?.(product)}
    >
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
        {imageLoading && imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.name || 'Product'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              setImageError(true);
              setImageLoading(false);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon className="w-16 h-16" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          {variants.length > 0 && (
            <Badge variant="outline" className="backdrop-blur-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-400 dark:border-gray-600 font-semibold shadow-sm">
              {variants.length} {variants.length === 1 ? 'variant' : 'variants'}
            </Badge>
          )}
        </div>
        <div className="absolute top-3 left-3 flex gap-1">
          <Badge className={`${selectedStockStatus.color} backdrop-blur-sm border`}>
            {selectedStockStatus.status}
          </Badge>
        </div>
        {variants.length > 0 && (
          <>
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-black/50 text-white backdrop-blur-sm">
                {formatPrice(displayCostPrice)}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-green-500/50 text-white backdrop-blur-sm">
                {formatPrice(displaySellPrice)}
              </Badge>
            </div>
          </>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-card-foreground mb-1 truncate">{product.name || 'Unknown Product'}</h3>
            {product.description && (
              <p className="text-muted-foreground text-sm line-clamp-2 mb-1">{product.description}</p>
            )}
            {product.sku && (
              <p className="text-muted-foreground text-xs">SKU: {product.sku}</p>
            )}
            {/* Variant Selector */}
            {variants.length > 1 && (
              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                <Label className="text-xs text-muted-foreground mb-1 block">Variant</Label>
                <Select 
                  value={selectedVariantId || ''} 
                  onValueChange={(value) => setSelectedVariantId(value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {variants.map((variant) => (
                      <SelectItem 
                        key={variant.id} 
                        value={variant.id}
                      >
                        {variant.name}
                        {variant.isDefault && ' (Default)'}
                        {variant.color && ` - ${variant.color}`}
                        {variant.size && ` (${variant.size})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-card-foreground hover:bg-sidebar-accent">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border" align="end">
              {onView && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(product); }} className="text-popover-foreground hover:bg-sidebar-accent">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(product); }} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stock Information - From selected variant */}
        {variants.length > 0 && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{selectedVariant ? 'Stock:' : 'Total Stock:'}</span>
              <div className="flex items-center gap-2">
                <span className="text-card-foreground font-medium">
                  {displayCurrentStock} {displayStockUnit}
                </span>
                {selectedVariant && (selectedVariant.activeStock?.quantity || 0) < 10 && (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                )}
              </div>
            </div>
            
            {/* Stock Bar - From selected variant */}
            {displayMaxStock > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>
                    Stock: {displayCurrentStock} / {displayMaxStock}
                  </span>
                  <span>
                    {Math.round((displayCurrentStock / displayMaxStock) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      displayCurrentStock < displayMinStock
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min((displayCurrentStock / displayMaxStock) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            )}

            {/* Pricing - From selected variant */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--glass-border)]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{selectedVariant ? 'Cost:' : 'Avg Cost:'}</span>
                <span className="text-card-foreground font-medium">{formatPrice(displayCostPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{selectedVariant ? 'Sell:' : 'Avg Sell:'}</span>
                <span className="text-green-600 dark:text-green-400 font-medium">{formatPrice(displaySellPrice)}</span>
              </div>
              {displayMargin && (
                <div className="flex items-center justify-between text-sm col-span-2">
                  <span className="text-muted-foreground">Margin:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">{displayMargin}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag, index) => {
              const tagObj = typeof tag === 'string' 
                ? { id: index.toString(), name: tag, color: '#3B82F6', icon: undefined }
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
        )}

        {/* Availability */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--glass-border)]">
          <Badge className={availabilityStatus.isAvailable ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
            {availabilityStatus.isAvailable ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                {availabilityStatus.text}
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3 mr-1" />
                {availabilityStatus.text}
              </>
            )}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

