import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowLeft, Warehouse, TrendingUp, Package, AlertTriangle, CheckCircle, Clock, DollarSign, Plus, Calendar, Building2, Hash, User, X, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { CustomDialog } from "../../../components/ui/custom-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { DatePicker } from "../../../components/common/DatePicker";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchCompanyProductRequest } from "../../../store/slices/companyProductsSlice";
import { fetchUsersRequest } from "../../../store/slices/usersSlice";
import { companyProductVariantsService } from "../../../services/companyProductVariants";
import { CompanyProductVariant } from "../../../services/companyProductVariants";
import { companyProductStockService, CompanyProductStock, CreateCompanyProductStockData } from "../../../services/companyProductStock";
import { toast } from "sonner";
import { formatCurrency } from "../../../utils";
import { UserSelectionDialog } from "../../../components/common/UserSelectionDialog";
import { currenciesService, Currency } from "../../../services/currencies";
import { DateDisplay } from "../../../components/common/DateDisplay";
import { Avatar, AvatarImage, AvatarFallback } from "../../../components/ui/avatar";
import { formatAvatarUrl } from "../../../utils";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";

interface VariantStockDetailsPageProps {
  productId: string;
  variantId: string;
  onBack: () => void;
}

const addStockSchema = yup.object({
  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .required("Quantity is required")
    .min(1, "Quantity must be at least 1")
    .integer("Quantity must be a whole number")
    .transform((_value, originalValue) => {
      if (originalValue === "" || originalValue == null || originalValue === undefined) {
        return undefined;
      }
      const num = Number(originalValue);
      return isNaN(num) ? undefined : num;
    }),
  costPrice: yup
    .number()
    .typeError("Cost price must be a number")
    .required("Cost price is required")
    .min(0, "Cost price must be 0 or greater")
    .transform((_value, originalValue) => {
      if (originalValue === "" || originalValue == null || originalValue === undefined) {
        return undefined;
      }
      const num = Number(originalValue);
      return isNaN(num) ? undefined : num;
    }),
  sellPrice: yup
    .number()
    .nullable()
    .optional()
    .min(0, "Sell price must be 0 or greater")
    .transform((value) => (value === "" || value === null || value === undefined ? null : value)),
  purchaseDate: yup
    .date()
    .nullable()
    .optional()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null || originalValue === undefined) {
        return null;
      }
      if (value instanceof Date && !isNaN(value.getTime())) {
        return value;
      }
      if (typeof originalValue === "string") {
        const parsed = new Date(originalValue);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      return null;
    }),
  expiryDate: yup
    .date()
    .nullable()
    .optional()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null || originalValue === undefined) {
        return null;
      }
      if (value instanceof Date && !isNaN(value.getTime())) {
        return value;
      }
      if (typeof originalValue === "string") {
        const parsed = new Date(originalValue);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      return null;
    }),
  supplierId: yup.string().optional().nullable().transform((value) => value || null),
  batchNumber: yup.string().optional().nullable().transform((value) => value || null),
});

type AddStockFormData = yup.InferType<typeof addStockSchema>;

export const VariantStockDetailsPage = ({ productId, variantId, onBack }: VariantStockDetailsPageProps) => {
  const dispatch = useAppDispatch();
  const { currentCompanyProduct, loading: productLoading } = useAppSelector((state) => state.companyProducts);
  const { user } = useAppSelector((state) => state.auth);
  const { companies, currentCompany } = useAppSelector((state) => state.companies);
  const [variant, setVariant] = useState<CompanyProductVariant | null>(null);
  const [stockEntries, setStockEntries] = useState<CompanyProductStock[]>([]);
  const [totalStock, setTotalStock] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [isEditStockDialogOpen, setIsEditStockDialogOpen] = useState(false);
  const [editingStockEntry, setEditingStockEntry] = useState<CompanyProductStock | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserSelectionDialogOpen, setIsUserSelectionDialogOpen] = useState(false);
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control
  } = useForm<AddStockFormData>({
    resolver: yupResolver(addStockSchema) as any,
    defaultValues: {
      quantity: undefined,
      costPrice: undefined,
      sellPrice: null,
      purchaseDate: null,
      expiryDate: null,
      supplierId: null,
      batchNumber: null,
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Fetch users for supplier selector - only if not already loaded or stale
  const { users, lastFetch: usersLastFetch } = useAppSelector((state) => state.users);
  
  useEffect(() => {
    // Only fetch if users are not loaded or data is stale (older than 5 minutes)
    const shouldFetchUsers = !users || users.length === 0 || 
      !usersLastFetch || (Date.now() - usersLastFetch) > 5 * 60 * 1000;
    
    if (shouldFetchUsers) {
      dispatch(fetchUsersRequest({}));
    }
  }, [dispatch, users, usersLastFetch]);

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

  // Format price using company currency
  const formatPrice = (price: number | undefined | null) => {
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
    
    const formatted = formatCurrency(numPrice, 'USD');
    // Replace $ with $  to add space
    return formatted.replace('$', '$ ');
  };

  // Fetch product
  useEffect(() => {
    if (productId) {
      dispatch(fetchCompanyProductRequest(productId));
    }
  }, [productId, dispatch]);

  // Fetch variant and stock data - use Promise.all to fetch in parallel
  useEffect(() => {
    const fetchData = async () => {
      if (!variantId) return;
      
      setLoading(true);
      try {
        // Fetch all data in parallel to reduce total request time
        const [variantData, stockData, total] = await Promise.all([
          companyProductVariantsService.getVariantById(variantId),
          companyProductStockService.getStockByVariantId(variantId, true),
          companyProductStockService.getTotalStock(variantId)
        ]);
        
        setVariant(variantData);
        setStockEntries(stockData);
        setTotalStock(total);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(error.message || "Failed to load stock details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [variantId]);

  const refreshStockData = async () => {
    if (!variantId) return;
    try {
      // Refresh all data in parallel to reduce total request time
      const [variantData, stockData, total] = await Promise.all([
        companyProductVariantsService.getVariantById(variantId),
        companyProductStockService.getStockByVariantId(variantId, true),
        companyProductStockService.getTotalStock(variantId)
      ]);
      
      setVariant(variantData);
      setStockEntries(stockData);
      setTotalStock(total);
    } catch (error: any) {
      console.error("Error refreshing stock data:", error);
    }
  };

  const onSubmitAddStock = async (data: AddStockFormData) => {
    if (!variantId) return;
    
    setIsSubmitting(true);
    try {
      const stockData: CreateCompanyProductStockData = {
        variantId,
        quantity: data.quantity!,
        costPrice: data.costPrice!,
        sellPrice: data.sellPrice || null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString().split('T')[0] : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : null,
        supplierId: data.supplierId || null,
        batchNumber: data.batchNumber || null,
      };

      await companyProductStockService.createStock(stockData);
      toast.success("Stock added successfully");
      setIsAddStockDialogOpen(false);
      reset();
      await refreshStockData();
    } catch (error: any) {
      console.error("Error adding stock:", error);
      toast.error(error.message || "Failed to add stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStock = (entry: CompanyProductStock) => {
    setEditingStockEntry(entry);
    reset({
      quantity: entry.quantity,
      costPrice: entry.costPrice,
      sellPrice: entry.sellPrice || null,
      purchaseDate: entry.purchaseDate ? new Date(entry.purchaseDate) : null,
      expiryDate: entry.expiryDate ? new Date(entry.expiryDate) : null,
      supplierId: entry.supplierId || null,
      batchNumber: entry.batchNumber || null,
    });
    setIsEditStockDialogOpen(true);
  };

  const onSubmitEditStock = async (data: AddStockFormData) => {
    if (!variantId || !editingStockEntry) return;
    
    setIsSubmitting(true);
    try {
      await companyProductStockService.updateStock(editingStockEntry.id, {
        quantity: data.quantity!,
        costPrice: data.costPrice!,
        sellPrice: data.sellPrice || null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString().split('T')[0] : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : null,
        supplierId: data.supplierId || null,
        batchNumber: data.batchNumber || null,
      });
      toast.success("Stock updated successfully");
      setIsEditStockDialogOpen(false);
      setEditingStockEntry(null);
      reset();
      await refreshStockData();
    } catch (error: any) {
      console.error("Error updating stock:", error);
      toast.error(error.message || "Failed to update stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStock = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this stock entry? This action cannot be undone.")) {
      return;
    }
    
    try {
      await companyProductStockService.deleteStock(entryId);
      toast.success("Stock entry deleted successfully");
      await refreshStockData();
    } catch (error: any) {
      console.error("Error deleting stock:", error);
      toast.error(error.message || "Failed to delete stock entry");
    }
  };

  const handleSetAsActive = async (entryId: string) => {
    try {
      await companyProductVariantsService.updateVariant(variantId, {
        activeStockId: entryId
      });
      toast.success("Active stock updated");
      await refreshStockData();
    } catch (error: any) {
      console.error("Error setting active stock:", error);
      toast.error(error.message || "Failed to set active stock");
    }
  };

  if (loading || productLoading) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
          <div className="flex flex-col items-center gap-3">
            <Warehouse className="w-12 h-12 text-muted-foreground animate-pulse" />
            <h3 className="text-lg font-semibold text-foreground">Loading stock details...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the data</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
          <div className="flex flex-col items-center gap-3">
            <Warehouse className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Variant not found</h3>
            <p className="text-muted-foreground mb-4">The variant you're looking for doesn't exist.</p>
            <Button onClick={onBack} variant="accent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Product
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isOutOfStock = totalStock === 0;

  const totalCostValue = stockEntries.reduce((sum, entry) => sum + (entry.quantity * entry.costPrice), 0);
  const totalSellValue = stockEntries
    .filter(entry => entry.sellPrice !== null && entry.sellPrice !== undefined)
    .reduce((sum, entry) => sum + (entry.quantity * (entry.sellPrice || 0)), 0);

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onBack}
            className="bg-[var(--glass-bg)] border-[var(--accent-border)]/30 hover:bg-[var(--accent-bg)] text-foreground hover:text-[var(--accent-text)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Stock Details</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {currentCompanyProduct?.name} - {variant.name}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddStockDialogOpen(true)}
          variant="accent"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Stock
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Overview */}
          <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--accent-border)]/30 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-[var(--accent-primary)]" />
                <h3 className="font-semibold text-foreground text-sm">Stock Overview</h3>
              </div>
              <Badge className={isOutOfStock ? "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30" : "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30"}>
                {isOutOfStock ? (
                  <span className="flex items-center gap-1 text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    Out of Stock
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs">
                    <CheckCircle className="w-3 h-3" />
                    In Stock
                  </span>
                )}
              </Badge>
            </div>

            <div className="space-y-3">
              {/* Stock Values */}
              <div className="grid grid-cols-2 gap-4">
                {/* Total Stock */}
                <div>
                  <Label className="text-xs text-muted-foreground">Total Available Stock</Label>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <p className="text-2xl font-bold text-foreground">{totalStock}</p>
                    <p className="text-xs text-muted-foreground">units</p>
                  </div>
                </div>
                
                {/* Active Stock */}
                <div>
                  <Label className="text-xs text-muted-foreground">Active Stock</Label>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <p className="text-2xl font-bold text-[var(--accent-primary)]">
                      {variant?.activeStock?.quantity || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">units</p>
                  </div>
                </div>
              </div>

              {/* Financial Statistics - Compact Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    Entries
                  </Label>
                  <p className="text-sm font-semibold text-foreground">{stockEntries.length}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                    <DollarSign className="w-3 h-3 text-blue-500" />
                    Cost Value
                  </Label>
                  <p className="text-sm font-semibold text-foreground">{formatPrice(totalCostValue)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                    <DollarSign className="w-3 h-3 text-green-500" />
                    Sell Value
                  </Label>
                  <p className="text-sm font-semibold text-green-500">{formatPrice(totalSellValue)}</p>
                </div>
              </div>

              {/* Profit and Income Percentage - Same Row */}
              {totalCostValue > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                      <TrendingUp className="w-3 h-3 text-purple-500" />
                      Profit
                    </Label>
                    <p className="text-sm font-semibold text-purple-500">
                      {formatPrice(totalSellValue - totalCostValue)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                      <TrendingUp className="w-3 h-3 text-purple-500" />
                      Income Percentage
                    </Label>
                    <p className="text-sm font-semibold text-purple-500">
                      {totalCostValue > 0 
                        ? (((totalSellValue - totalCostValue) / totalCostValue) * 100).toFixed(1)
                        : '0.0'}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Stock Entries List */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--accent-border)]/30 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[var(--accent-primary)]" />
                <h3 className="font-semibold text-foreground">Stock Entries</h3>
              </div>
              <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">{stockEntries.length} entries</Badge>
            </div>

            <div className="space-y-4">
              {stockEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No stock entries found</p>
                  <Button
                    onClick={() => setIsAddStockDialogOpen(true)}
                    variant="accent"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Stock Entry
                  </Button>
                </div>
              ) : (
                stockEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`relative p-4 bg-[var(--input-background)] border rounded-lg hover:bg-[var(--accent-bg)]/50 transition-colors ${
                      variant?.activeStockId === entry.id 
                        ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20 bg-[var(--accent-bg)]/30' 
                        : 'border-[var(--glass-border)]'
                    }`}
                  >
                    {/* 3-Dot Menu - Top Right */}
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-[var(--accent-bg)]"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--accent-border)]/30"
                        >
                          {variant?.activeStockId !== entry.id && (
                            <DropdownMenuItem
                              onClick={() => handleSetAsActive(entry.id)}
                              className="hover:bg-[var(--accent-bg)]"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Set as Active
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleEditStock(entry)}
                            className="hover:bg-[var(--accent-bg)]"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteStock(entry.id)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="flex items-start justify-between gap-4 pr-10">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
                            {entry.quantity} units
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {entry.purchaseDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Purchase:</span>
                              <span className="text-foreground">
                                <DateDisplay date={entry.purchaseDate} />
                              </span>
                            </div>
                          )}
                          {entry.expiryDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Expiry:</span>
                              <span className="text-foreground">
                                <DateDisplay date={entry.expiryDate} />
                              </span>
                            </div>
                          )}
                          {entry.supplier && (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Supplier:</span>
                              <span className="text-foreground">
                                {entry.supplier.firstName || ''} {entry.supplier.lastName || ''} {entry.supplier.email ? `(${entry.supplier.email})` : ''}
                              </span>
                            </div>
                          )}
                          {entry.batchNumber && (
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Batch:</span>
                              <span className="text-foreground">{entry.batchNumber}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            Added <DateDisplay date={entry.createdAt} fallback="N/A" />
                          </span>
                        </div>
                      </div>
                      
                      {/* Price Section - Right Side */}
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        {/* Cost Price */}
                        <div className="flex items-center gap-2 min-w-[120px] justify-end">
                          <span className="text-xs text-muted-foreground">Cost:</span>
                          <span className="text-lg font-semibold text-[var(--accent-primary)]">
                            {formatPrice(entry.costPrice)}
                          </span>
                        </div>
                        
                        {/* Sell Price */}
                        {entry.sellPrice !== null && entry.sellPrice !== undefined && (
                          <div className="flex items-center gap-2 min-w-[120px] justify-end">
                            <span className="text-xs text-muted-foreground">Sell:</span>
                            <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                              {formatPrice(entry.sellPrice)}
                            </span>
                          </div>
                        )}
                        
                        {/* Active Stock Badge */}
                        {variant?.activeStockId === entry.id && (
                          <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                            Active Stock
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Variant Information */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--accent-border)]/30 shadow-lg">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[var(--accent-primary)]" />
              Variant Information
            </h3>
            <div className="space-y-3">
              {/* Product Name and Image */}
              {currentCompanyProduct && (
                <div className="flex items-center gap-3">
                  {currentCompanyProduct.imageUrl && (
                    <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={currentCompanyProduct.imageUrl.startsWith('http') 
                          ? currentCompanyProduct.imageUrl 
                          : formatAvatarUrl(currentCompanyProduct.imageUrl)}
                        alt={currentCompanyProduct.name || 'Product'}
                        className="w-full h-full object-cover"
                        fallbackSrc="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=96&h=96&fit=crop"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Product</p>
                    <p className="font-medium text-foreground truncate">{currentCompanyProduct.name}</p>
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground">Variant Name</p>
                <p className="font-medium text-foreground">{variant.name}</p>
              </div>
              {variant.sku && (
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-medium text-foreground">{variant.sku}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={variant.isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                  {variant.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {(variant.minStock !== undefined || variant.maxStock !== undefined) && (
                <>
                  {variant.minStock !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">Min Stock</p>
                      <p className="font-medium text-foreground">{variant.minStock}</p>
                    </div>
                  )}
                  {variant.maxStock !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">Max Stock</p>
                      <p className="font-medium text-foreground">{variant.maxStock}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>


          {/* Stock Alerts */}
          {isOutOfStock && (
            <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg border-red-500/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Stock Alert</h3>
                  <p className="text-sm text-muted-foreground">
                    This variant is out of stock. Consider adding new stock entries.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add Stock Dialog */}
      <CustomDialog
        open={isAddStockDialogOpen}
        onOpenChange={setIsAddStockDialogOpen}
        customHeader={
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[var(--accent-primary)]" />
            <span>Add Stock Entry</span>
          </div>
        }
        description={`Add a new stock entry for ${variant.name}. Each stock entry can have different pricing and supplier information.`}
        className="bg-[var(--glass-bg)] border-[var(--accent-border)]/30 backdrop-blur-xl max-w-2xl max-h-[90vh] overflow-y-auto"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddStockDialogOpen(false);
                reset();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-stock-form"
              variant="accent"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Stock"}
            </Button>
          </>
        }
      >
          <form id="add-stock-form" onSubmit={handleSubmit(onSubmitAddStock)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-foreground">
                  Quantity <span className="text-[var(--accent-primary)]">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  {...register("quantity")}
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20"
                  placeholder="Enter quantity"
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500">{errors.quantity.message}</p>
                )}
              </div>

              {/* Batch Number */}
              <div className="space-y-2">
                <Label htmlFor="batchNumber" className="text-foreground">Batch Number</Label>
                <Input
                  id="batchNumber"
                  {...register("batchNumber")}
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20"
                  placeholder="Enter batch number"
                />
                {errors.batchNumber && (
                  <p className="text-sm text-red-500">{errors.batchNumber.message}</p>
                )}
              </div>

              {/* Cost Price */}
              <div className="space-y-2">
                <Label htmlFor="costPrice" className="text-foreground">
                  Cost Price <span className="text-[var(--accent-primary)]">*</span>
                </Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  {...register("costPrice")}
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20"
                  placeholder="0.00"
                />
                {errors.costPrice && (
                  <p className="text-sm text-red-500">{errors.costPrice.message}</p>
                )}
              </div>

              {/* Sell Price */}
              <div className="space-y-2">
                <Label htmlFor="sellPrice" className="text-foreground">
                  Sell Price
                </Label>
                <Input
                  id="sellPrice"
                  type="number"
                  step="0.01"
                  {...register("sellPrice")}
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20"
                  placeholder="0.00 (optional)"
                />
                {errors.sellPrice && (
                  <p className="text-sm text-red-500">{errors.sellPrice.message}</p>
                )}
              </div>

              {/* Purchase Date */}
              <div className="space-y-2">
                <Label className="text-foreground">Purchase Date</Label>
                <Controller
                  name="purchaseDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value || undefined}
                      onChange={(date) => field.onChange(date || null)}
                      placeholder="Select purchase date"
                      className="w-full"
                    />
                  )}
                />
                {errors.purchaseDate && (
                  <p className="text-sm text-red-500">{errors.purchaseDate.message}</p>
                )}
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label className="text-foreground">Expiry Date</Label>
                <Controller
                  name="expiryDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value || undefined}
                      onChange={(date) => field.onChange(date || null)}
                      placeholder="Select expiry date"
                      className="w-full"
                    />
                  )}
                />
                {errors.expiryDate && (
                  <p className="text-sm text-red-500">{errors.expiryDate.message}</p>
                )}
              </div>

              {/* Supplier */}
              <div className="space-y-2">
                <Label htmlFor="supplierId" className="text-foreground">Supplier</Label>
                <Controller
                  name="supplierId"
                  control={control}
                  render={({ field }) => {
                    const selectedUser = users?.find((u) => String(u.id) === String(field.value || null));
                    const dialogTitle = "Select Supplier";
                    const buttonLabel = dialogTitle; // Dynamic label matching the dialog title
                    
                    const getDisplayName = (user: any) => {
                      const firstName = user?.firstName || "";
                      const lastName = user?.lastName || "";
                      const fullName = `${firstName} ${lastName}`.trim();
                      return fullName || user?.email || "Unknown User";
                    };
                    const getInitials = (user: any) => {
                      const firstName = user?.firstName || "";
                      const lastName = user?.lastName || "";
                      if (firstName && lastName) {
                        return `${firstName[0]}${lastName[0]}`.toUpperCase();
                      }
                      if (firstName) {
                        return firstName[0].toUpperCase();
                      }
                      if (user?.email) {
                        return user.email[0].toUpperCase();
                      }
                      return "U";
                    };

                    return (
                      <div className="space-y-2">
                        {selectedUser ? (
                          <div className="flex items-center gap-3 p-3 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md">
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarImage
                                src={formatAvatarUrl(selectedUser.avatar, selectedUser.firstName, selectedUser.lastName)}
                                alt={getDisplayName(selectedUser)}
                              />
                              <AvatarFallback className="text-sm">
                                {getInitials(selectedUser)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm font-medium text-foreground truncate">
                                {getDisplayName(selectedUser)}
                              </span>
                              {selectedUser.email && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {selectedUser.email}
                                </span>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => field.onChange(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start bg-[var(--input-background)] border-[var(--glass-border)] text-foreground hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)]"
                            onClick={() => setIsUserSelectionDialogOpen(true)}
                          >
                            <User className="h-4 w-4 mr-2" />
                            {buttonLabel}
                          </Button>
                        )}
                        <UserSelectionDialog
                          open={isUserSelectionDialogOpen}
                          onOpenChange={setIsUserSelectionDialogOpen}
                          value={field.value ?? null}
                          onChange={(userId) => field.onChange(userId)}
                          users={users || []}
                          title={dialogTitle}
                          description="Choose a supplier from the list"
                          placeholder="Select a supplier (optional)"
                          allowClear={true}
                          error={!!errors.supplierId}
                        />
                      </div>
                    );
                  }}
                />
                {errors.supplierId && (
                  <p className="text-sm text-red-500">{errors.supplierId.message}</p>
                )}
              </div>
            </div>
          </form>
      </CustomDialog>

      {/* Edit Stock Dialog */}
      <CustomDialog
        open={isEditStockDialogOpen}
        onOpenChange={(open) => {
          setIsEditStockDialogOpen(open);
          if (!open) {
            setEditingStockEntry(null);
            reset();
          }
        }}
        customHeader={
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-[var(--accent-primary)]" />
            <span>Edit Stock Entry</span>
          </div>
        }
        description={`Update stock entry information for ${variant.name}.`}
        className="bg-[var(--glass-bg)] border-[var(--accent-border)]/30 backdrop-blur-xl max-w-2xl max-h-[90vh] overflow-y-auto"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditStockDialogOpen(false);
                setEditingStockEntry(null);
                reset();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-stock-form"
              variant="accent"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Stock"}
            </Button>
          </>
        }
      >
          <form id="edit-stock-form" onSubmit={handleSubmit(onSubmitEditStock)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="edit-quantity" className="text-foreground">
                  Quantity <span className="text-[var(--accent-primary)]">*</span>
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  {...register("quantity")}
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20"
                  placeholder="Enter quantity"
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500">{errors.quantity.message}</p>
                )}
              </div>

              {/* Batch Number */}
              <div className="space-y-2">
                <Label htmlFor="edit-batchNumber" className="text-foreground">Batch Number</Label>
                <Input
                  id="edit-batchNumber"
                  {...register("batchNumber")}
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20"
                  placeholder="Enter batch number"
                />
                {errors.batchNumber && (
                  <p className="text-sm text-red-500">{errors.batchNumber.message}</p>
                )}
              </div>

              {/* Cost Price */}
              <div className="space-y-2">
                <Label htmlFor="edit-costPrice" className="text-foreground">
                  Cost Price <span className="text-[var(--accent-primary)]">*</span>
                </Label>
                <Input
                  id="edit-costPrice"
                  type="number"
                  step="0.01"
                  {...register("costPrice")}
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20"
                  placeholder="0.00"
                />
                {errors.costPrice && (
                  <p className="text-sm text-red-500">{errors.costPrice.message}</p>
                )}
              </div>

              {/* Sell Price */}
              <div className="space-y-2">
                <Label htmlFor="edit-sellPrice" className="text-foreground">
                  Sell Price
                </Label>
                <Input
                  id="edit-sellPrice"
                  type="number"
                  step="0.01"
                  {...register("sellPrice")}
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20"
                  placeholder="0.00 (optional)"
                />
                {errors.sellPrice && (
                  <p className="text-sm text-red-500">{errors.sellPrice.message}</p>
                )}
              </div>

              {/* Purchase Date */}
              <div className="space-y-2">
                <Label className="text-foreground">Purchase Date</Label>
                <Controller
                  name="purchaseDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value || undefined}
                      onChange={(date) => field.onChange(date || null)}
                      placeholder="Select purchase date"
                      className="w-full"
                    />
                  )}
                />
                {errors.purchaseDate && (
                  <p className="text-sm text-red-500">{errors.purchaseDate.message}</p>
                )}
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label className="text-foreground">Expiry Date</Label>
                <Controller
                  name="expiryDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value || undefined}
                      onChange={(date) => field.onChange(date || null)}
                      placeholder="Select expiry date"
                      className="w-full"
                    />
                  )}
                />
                {errors.expiryDate && (
                  <p className="text-sm text-red-500">{errors.expiryDate.message}</p>
                )}
              </div>

              {/* Supplier */}
              <div className="space-y-2">
                <Label htmlFor="edit-supplierId" className="text-foreground">Supplier</Label>
                <Controller
                  name="supplierId"
                  control={control}
                  render={({ field }) => {
                    const selectedUser = users?.find((u) => String(u.id) === String(field.value || null));
                    const dialogTitle = "Select Supplier";
                    const buttonLabel = dialogTitle;
                    
                    const getDisplayName = (user: any) => {
                      const firstName = user?.firstName || "";
                      const lastName = user?.lastName || "";
                      const fullName = `${firstName} ${lastName}`.trim();
                      return fullName || user?.email || "Unknown User";
                    };
                    const getInitials = (user: any) => {
                      const firstName = user?.firstName || "";
                      const lastName = user?.lastName || "";
                      if (firstName && lastName) {
                        return `${firstName[0]}${lastName[0]}`.toUpperCase();
                      }
                      if (firstName) {
                        return firstName[0].toUpperCase();
                      }
                      if (user?.email) {
                        return user.email[0].toUpperCase();
                      }
                      return "U";
                    };

                    return (
                      <div className="space-y-2">
                        {selectedUser ? (
                          <div className="flex items-center gap-3 p-3 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md">
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarImage
                                src={formatAvatarUrl(selectedUser.avatar, selectedUser.firstName, selectedUser.lastName)}
                                alt={getDisplayName(selectedUser)}
                              />
                              <AvatarFallback className="text-sm">
                                {getInitials(selectedUser)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm font-medium text-foreground truncate">
                                {getDisplayName(selectedUser)}
                              </span>
                              {selectedUser.email && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {selectedUser.email}
                                </span>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => field.onChange(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start bg-[var(--input-background)] border-[var(--glass-border)] text-foreground hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)]"
                            onClick={() => setIsUserSelectionDialogOpen(true)}
                          >
                            <User className="h-4 w-4 mr-2" />
                            {buttonLabel}
                          </Button>
                        )}
                        <UserSelectionDialog
                          open={isUserSelectionDialogOpen}
                          onOpenChange={setIsUserSelectionDialogOpen}
                          value={field.value ?? null}
                          onChange={(userId) => field.onChange(userId)}
                          users={users || []}
                          title={dialogTitle}
                          description="Choose a supplier from the list"
                          placeholder="Select a supplier (optional)"
                          allowClear={true}
                          error={!!errors.supplierId}
                        />
                      </div>
                    );
                  }}
                />
                {errors.supplierId && (
                  <p className="text-sm text-red-500">{errors.supplierId.message}</p>
                )}
              </div>
            </div>
          </form>
      </CustomDialog>
    </div>
  );
};
