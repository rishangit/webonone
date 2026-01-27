import { Download, Printer, Mail, Calendar, User, Clock, Receipt, Package, FileText, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";
import { toast } from "sonner";
import { appointmentHistoryService } from "../services/appointmentHistory";
import { formatAvatarUrl } from "../utils";

interface BillingItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  unit?: string;
}

interface BillData {
  appointmentId: string;
  patientName: string;
  patientImage?: string;
  patientEmail?: string;
  patientPhone?: string;
  service: string;
  date: string;
  time: string;
  staff?: {
    name: string;
    image?: string;
    specialization: string;
  };
  billingItems: BillingItem[];
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  generatedAt: string;
  billNumber: string;
}

interface BillPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string; // Appointment ID to fetch history from database
  billData?: BillData;
}

export function BillPreviewDialog({ open, onOpenChange, appointmentId, billData }: BillPreviewDialogProps) {
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch appointment history from database when dialog opens
  useEffect(() => {
    if (open && appointmentId) {
      setLoading(true);
      appointmentHistoryService.getAppointmentHistoryByAppointmentId(appointmentId, true) // enrich=true
        .then((history) => {
          if (history) {
            setHistoryData(history);
          } else {
            // If no history found, use the provided billData (fallback)
            setHistoryData(null);
            console.log('[BillPreviewDialog] No history found, using fallback billData');
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching appointment history:', error);
          // Don't show error toast for 404 - it's expected if history doesn't exist
          if (!error.message?.includes('404') && !error.message?.includes('not found')) {
            toast.error('Failed to load bill data from database');
          }
          setHistoryData(null);
          setLoading(false);
        });
    }
  }, [open, appointmentId]);

  // Map history data to bill data format
  const displayBillData: BillData | undefined = historyData ? (() => {
    // Extract user details from history
    const userFirstName = (historyData as any).userFirstName || '';
    const userLastName = (historyData as any).userLastName || '';
    const userName = historyData.userName || (userFirstName && userLastName ? `${userFirstName} ${userLastName}`.trim() : 'Unknown User');
    const userEmail = historyData.userEmail || '';
    const userPhone = historyData.userPhone || '';
    const userAvatar = historyData.userAvatar || null;

    // Combine servicesUsed and productsUsed into billingItems
    // Note: name/description are optional (enriched fields), use fallbacks if not available
    const billingItems: BillingItem[] = [
      ...(historyData.servicesUsed || []).map((service: any, index: number) => ({
        id: `service-${index}`,
        type: 'service' as const,
        name: service.name || `Service-${service.serviceId || index}`,
        description: service.description || null,
        quantity: service.quantity,
        unitPrice: service.unitPrice,
        discount: service.discount || 0,
        total: (service.quantity * service.unitPrice) * (1 - (service.discount || 0) / 100)
      })),
      ...(historyData.productsUsed || []).map((product: any, index: number) => ({
        id: `product-${index}`,
        type: 'product' as const,
        name: product.name || `Product-${product.productId || index}`,
        description: product.description || null,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        discount: product.discount || 0,
        unit: product.unit || null,
        total: (product.quantity * product.unitPrice) * (1 - (product.discount || 0) / 100)
      }))
    ];

    return {
      appointmentId: historyData.appointmentId,
      patientName: userName,
      patientImage: userAvatar ? formatAvatarUrl(userAvatar, userFirstName, userLastName) : undefined,
      patientEmail: userEmail,
      patientPhone: userPhone,
      service: 'Service', // serviceName removed - would need to fetch from serviceId
      date: historyData.createdAt ? historyData.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      time: historyData.createdAt ? new Date(historyData.createdAt).toTimeString().split(' ')[0].substring(0, 5) : '00:00',
      staff: historyData.staffId ? {
        name: 'Staff', // Will be looked up from staffId if staff data is available
        image: undefined,
        specialization: 'Staff'
      } : undefined,
      billingItems: billingItems,
      subtotal: historyData.subtotal || 0,
      discountAmount: historyData.discountAmount || 0,
      finalAmount: historyData.totalAmount || 0,
      generatedAt: historyData.createdAt || new Date().toISOString(),
      billNumber: `BILL-${historyData.id}`
    };
  })() : billData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleDownload = () => {
    toast.success("Bill downloaded successfully!");
    // Here you would implement PDF generation and download
  };

  const handlePrint = () => {
    window.print();
    toast.success("Printing bill...");
  };

  const handleEmail = () => {
    toast.success("Bill sent to patient's email!");
    // Here you would implement email sending
  };

  if (!displayBillData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-popover border-border max-w-4xl max-h-[90vh] overflow-hidden"
        aria-describedby="bill-preview-description"
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Receipt className="w-5 h-5 text-[var(--accent-primary)]" />
            Bill Preview - #{displayBillData.billNumber}
            {loading && <span className="text-sm text-muted-foreground">(Loading...)</span>}
          </DialogTitle>
          <DialogDescription id="bill-preview-description" className="text-muted-foreground">
            Review and download the generated bill for this appointment
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto custom-scrollbar max-h-[calc(90vh-200px)]">
          {/* Company Header */}
          <div className="text-center mb-8 p-6 bg-gradient-to-br from-[var(--accent-bg)] to-[var(--accent-bg)]/50 border border-[var(--accent-border)] rounded-lg shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-lg">
                <span className="text-[var(--accent-button-text)] font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AppointmentPro</h1>
                <p className="text-sm text-muted-foreground font-medium">Professional Healthcare Services</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>123 Healthcare Ave, Medical District</p>
              <p>Phone: <span className="font-medium">(555) 123-4567</span> | Email: <span className="font-medium">billing@appointmentpro.com</span></p>
            </div>
          </div>

          {/* Consolidated Bill Information Card */}
          <Card className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] mb-4">
            {/* Patient Information */}
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={displayBillData.patientImage} />
                  <AvatarFallback className="bg-[var(--accent-primary)] text-white">
                    {displayBillData.patientName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{displayBillData.patientName}</p>
                  <p className="text-sm text-muted-foreground">Patient ID: #PAT-{displayBillData.appointmentId.slice(-8)}</p>
                  {displayBillData.patientEmail && (
                    <p className="text-xs text-muted-foreground mt-1">{displayBillData.patientEmail}</p>
                  )}
                  {displayBillData.patientPhone && displayBillData.patientPhone !== 'N/A' && (
                    <p className="text-xs text-muted-foreground">{displayBillData.patientPhone}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Appointment Details */}
            <div className="mb-4">
              <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--accent-text)]" />
                Appointment Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="text-foreground font-medium">{displayBillData.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="text-foreground">{formatDate(displayBillData.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="text-foreground">{displayBillData.time}</span>
                </div>
                {displayBillData.staff && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider:</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={displayBillData.staff.image} />
                        <AvatarFallback className="bg-[var(--accent-primary)] text-white text-xs">
                          {displayBillData.staff.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-foreground font-medium">{displayBillData.staff.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-3" />

            {/* Bill Information */}
            <div>
              <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[var(--accent-text)]" />
                Bill Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bill Number:</span>
                  <span className="text-foreground font-mono">#{displayBillData.billNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Generated:</span>
                  <span className="text-foreground">{new Date(displayBillData.generatedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                    Completed
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Billing Items */}
          <Card className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] mb-4">
            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[var(--accent-text)]" />
              Services & Products Used
            </h3>
            
            <div className="space-y-2">
              {displayBillData.billingItems && displayBillData.billingItems.length > 0 ? (
                displayBillData.billingItems.map((item, index) => {
                const itemSubtotal = item.quantity * item.unitPrice;
                const discountAmount = itemSubtotal * (item.discount / 100);
                const finalItemTotal = item.total !== undefined ? item.total : (itemSubtotal - discountAmount);
                
                return (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {item.type === 'service' ? (
                        <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      ) : (
                        <Package className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Qty: {item.quantity}{item.unit && ` ${item.unit}`}</span>
                          <span>•</span>
                          <span>{formatCurrency(item.unitPrice)}</span>
                          {item.discount > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-green-600">{item.discount}% off</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {item.discount > 0 ? (
                        <div>
                          <div className="text-xs text-muted-foreground line-through">
                            {formatCurrency(itemSubtotal)}
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            {formatCurrency(finalItemTotal)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-foreground">
                          {formatCurrency(finalItemTotal)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No items found in bill</p>
                </div>
              )}
            </div>
          </Card>

          {/* Bill Totals */}
          <Card className="p-4 bg-gradient-to-br from-[var(--accent-bg)] to-[var(--accent-bg)]/70 border border-[var(--accent-border)]">
            <h3 className="font-medium text-foreground mb-3">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal (before discounts):</span>
                <span className="text-foreground font-medium">{formatCurrency(displayBillData.subtotal)}</span>
              </div>
              {displayBillData.discountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Discounts Applied:</span>
                  <span className="text-green-600 font-medium">-{formatCurrency(displayBillData.discountAmount)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-foreground font-semibold">Total Amount Due:</span>
                <span className="text-[var(--accent-text)] font-bold text-lg">
                  {formatCurrency(displayBillData.finalAmount)}
                </span>
              </div>
              
              {/* Savings highlight */}
              {displayBillData.discountAmount > 0 && (
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <p className="font-medium text-xs">
                      You saved {formatCurrency(displayBillData.discountAmount)} with applied discounts!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Footer */}
          <div className="mt-4 text-center">
            <div className="p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg">
              <p className="text-foreground font-medium mb-1">Thank you for choosing AppointmentPro!</p>
              <p className="text-sm text-muted-foreground mb-2">
                We appreciate your trust in our healthcare services. 
              </p>
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground">
                Questions about this bill? Contact us at <span className="font-medium text-[var(--accent-text)]">billing@appointmentpro.com</span> or <span className="font-medium text-[var(--accent-text)]">(555) 123-4567</span>
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border">
          <Button 
            variant="outline" 
            onClick={handleEmail}
            className="bg-transparent border-border text-foreground hover:bg-accent"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email to Patient
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="bg-transparent border-border text-foreground hover:bg-accent"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button 
            onClick={handleDownload}
            variant="accent"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}