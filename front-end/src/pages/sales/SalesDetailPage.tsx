import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock, CreditCard, DollarSign, Package, User, Users, FileText, Trash2 } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { useIsMobile } from "../../components/ui/use-mobile";
import { companySalesService, CompanySale } from "../../services/companySales";
import { formatAvatarUrl } from "../../utils";
import { toast } from "sonner";
import { DateDisplay } from "../../components/common/DateDisplay";
import { isRole, UserRole } from "../../types/user";
import { useAppSelector } from "../../store/hooks";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { currenciesService, Currency } from "../../services/currencies";

interface SalesDetailPageProps {
  saleId: string;
  onBack: () => void;
}

export const SalesDetailPage = ({ saleId, onBack }: SalesDetailPageProps) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { companies, currentCompany } = useAppSelector((state) => state.companies);
  const isMobile = useIsMobile();
  const isCompanyOwner = isRole(user?.role, UserRole.COMPANY_OWNER);

  const [sale, setSale] = useState<CompanySale | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        setLoading(true);
        const saleData = await companySalesService.getCompanySaleById(saleId, true);
        setSale(saleData);
      } catch (error: any) {
        console.error('Error fetching sale:', error);
        toast.error(error.message || 'Failed to load sale details');
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [saleId]);

  // Fetch company currency
  useEffect(() => {
    const fetchCompanyCurrency = async () => {
      const companyId = user?.companyId || sale?.companyId;
      
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
  }, [user?.companyId, sale?.companyId, companies, currentCompany]);

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

  // Removed formatDate - using DateDisplay component for consistent date formatting

  const handleDeleteSale = async () => {
    if (!sale) return;
    
    try {
      setDeleting(true);
      await companySalesService.deleteSale(sale.id);
      toast.success("Sale deleted successfully");
      onBack();
    } catch (error: any) {
      console.error('Error deleting sale:', error);
      toast.error(error.message || "Failed to delete sale");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!sale) return;
    
    try {
      setDeleting(true);
      const updatedSale = await companySalesService.deleteSaleItem(sale.id, itemId);
      setSale(updatedSale);
      toast.success("Item removed from sale");
    } catch (error: any) {
      console.error('Error deleting sale item:', error);
      toast.error(error.message || "Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading sale details...</p>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Sale Not Found</h3>
          <p className="text-muted-foreground mb-4">The sale you're looking for doesn't exist.</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sales
          </Button>
        </div>
      </div>
    );
  }

  const customerName = sale.userName || 
    (sale.userFirstName && sale.userLastName 
      ? `${sale.userFirstName} ${sale.userLastName}` 
      : 'Unknown Customer');

  const saleType = sale.appointmentId || (sale.servicesUsed && sale.servicesUsed.length > 0) 
    ? 'appointment' 
    : 'product';

  const allItems = [
    ...(sale.servicesUsed || []).map((service: any) => ({
      ...service,
      itemType: 'service',
      id: service.id
    })),
    ...(sale.productsUsed || []).map((product: any) => ({
      ...product,
      itemType: 'product',
      id: product.id
    }))
  ];

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-[var(--glass-border)] text-foreground hover:bg-[var(--accent-bg)]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Sale Details</h1>
            <p className="text-sm text-muted-foreground">Sale ID: {sale.id}</p>
          </div>
        </div>
        {isCompanyOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-[var(--glass-border)]">
                <FileText className="w-4 h-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Sale
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16 ring-2 ring-[var(--accent-border)]">
                <AvatarImage src={sale.userAvatar ? formatAvatarUrl(sale.userAvatar) : undefined} />
                <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
                  {customerName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{customerName}</h3>
                  <Badge 
                    variant="outline" 
                    className={saleType === 'appointment' 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300' 
                      : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300'
                    }
                  >
                    {saleType === 'appointment' ? 'Appointment Sale' : 'Product Sale'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {sale.userEmail && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{sale.userEmail}</span>
                    </div>
                  )}
                  {sale.userPhone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{sale.userPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Sale Items */}
          <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-[var(--accent-text)]" />
                Items ({allItems.length})
              </h3>
            </div>
            <div className="space-y-3">
              {allItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No items in this sale</p>
              ) : (
                allItems.map((item: any, index: number) => (
                  <div 
                    key={item.id || index} 
                    className="flex items-center justify-between p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground">{item.name || 'Item'}</p>
                        <Badge variant="outline" className="text-xs">
                          {item.itemType === 'service' ? 'Service' : 'Product'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} • Unit Price: {formatCurrency(item.unitPrice)}
                        {item.discount > 0 && (
                          <span className="text-green-600 ml-2">
                            ({item.discount}% discount)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        {item.discount > 0 ? (
                          <div>
                            <p className="text-xs text-muted-foreground line-through">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </p>
                            <p className="font-semibold text-foreground">
                              {formatCurrency(item.quantity * item.unitPrice * (1 - item.discount / 100))}
                            </p>
                          </div>
                        ) : (
                          <p className="font-semibold text-foreground">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </p>
                        )}
                      </div>
                      {isCompanyOwner && item.id && !item.id.startsWith('service-') && !item.id.startsWith('product-') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={deleting}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Sale Information */}
          <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <h3 className="text-lg font-semibold text-foreground mb-4">Sale Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground"><DateDisplay date={sale.createdAt} fallback="N/A" /></p>
                </div>
              </div>
              {sale.updatedAt && sale.updatedAt !== sale.createdAt && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium text-foreground"><DateDisplay date={sale.updatedAt} fallback="N/A" /></p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium text-foreground">Cash</p>
                </div>
              </div>
              {sale.staffId && (
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Staff Member</p>
                    <p className="font-medium text-foreground">Staff ID: {sale.staffId}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Summary */}
          <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <h3 className="text-lg font-semibold text-foreground mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="text-foreground">{formatCurrency(sale.subtotal || 0)}</span>
              </div>
              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="text-red-600 dark:text-red-400">-{formatCurrency(sale.discountAmount || 0)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">Total:</span>
                <span className="text-xl font-bold text-[var(--accent-text)]">
                  {formatCurrency(sale.totalAmount || 0)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <CustomDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Sale"
        description="Are you sure you want to delete this sale? This action cannot be undone."
        icon={<Trash2 className="w-5 h-5 text-red-600" />}
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteSale}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Sale"}
          </Button>
        </div>
      </CustomDialog>
    </div>
  );
};

