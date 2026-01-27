import { useState } from "react";
import { useIsMobile } from "../../components/ui/use-mobile";
import { Clock, User, Phone, MapPin, Calendar, Users, Stethoscope, MoreVertical, CheckCircle, XCircle, Edit, Eye, FileText, RotateCcw, Play, Check, Receipt, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { StaffAssignmentDialog } from "../staff";
import { AppointmentBillingDialog } from "./AppointmentBillingDialog";
import { BillPreviewDialog } from "../../components/BillPreviewDialog";
import { DateDisplay } from "../../components/common/DateDisplay";
import { formatDate } from "../../utils";
import { toast } from "sonner";
import { AppointmentStatus, normalizeAppointmentStatus, getAppointmentStatusLabel } from "../../types/appointmentStatus";
import { useAppDispatch } from "../../store/hooks";
import { updateAppointmentRequest } from "../../store/slices/appointmentsSlice";

const formatCurrency = (amount: number) => `${amount.toFixed(2)}`;

interface AppointmentCardProps {
  id: string;
  patientName: string;
  patientImage?: string;
  date: string;
  time: string;
  duration: string;
  type: string;
  status: AppointmentStatus | string;
  phone: string;
  location: string;
  staff?: {
    name: string;
    image?: string;
    specialization: string;
  };
  preferredStaff?: {
    id: string;
    name: string;
    image?: string;
    specialization: string;
  }[];
  service?: string;
  viewMode?: 'card' | 'list';
  onStatusUpdate?: (status: string, completionData?: any) => void;
  onDelete?: () => void;
  _originalAppointment?: any; // Original appointment or history data
}

export function AppointmentCard({ 
  id,
  patientName, 
  patientImage,
  date,
  time, 
  duration, 
  type, 
  status, 
  phone, 
  location,
  staff,
  preferredStaff,
  service,
  viewMode = 'card',
  onStatusUpdate,
  onDelete,
  _originalAppointment
}: AppointmentCardProps) {
  const dispatch = useAppDispatch();
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [showBillingDialog, setShowBillingDialog] = useState(false);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [lastGeneratedBill, setLastGeneratedBill] = useState<any>(null);
  const [showPreferredStaffDropdown, setShowPreferredStaffDropdown] = useState(false);
  const isMobile = useIsMobile();

  const getStatusColor = (status: string | number) => {
    const normalizedStatus = normalizeAppointmentStatus(status);
    if (normalizedStatus === null) return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
    
    switch (normalizedStatus) {
      case AppointmentStatus.CONFIRMED: return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case AppointmentStatus.PENDING: return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case AppointmentStatus.IN_PROGRESS: return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case AppointmentStatus.COMPLETED: return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case AppointmentStatus.CANCELLED: return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      case AppointmentStatus.NO_SHOW: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
    }
  };
  
  const getStatusDisplay = (status: string | number) => {
    const normalizedStatus = normalizeAppointmentStatus(status);
    return normalizedStatus !== null ? getAppointmentStatusLabel(normalizedStatus) : String(status);
  };
  
  // Helper to check if status matches enum value
  const isStatus = (status: string | number, enumValue: AppointmentStatus): boolean => {
    const normalized = normalizeAppointmentStatus(status);
    return normalized === enumValue;
  };

  // Use DateDisplay component for consistent date formatting
  // Removed local formatDate function - now using DateDisplay component

  const handleStaffAssignment = (selectedStaff: { id: string; name: string; image?: string; specialization: string }) => {
    if (!_originalAppointment) {
      toast.error("Cannot assign staff: appointment data not available");
      return;
    }

    // Update appointment with staffId and status to CONFIRMED
    dispatch(updateAppointmentRequest({
      id: _originalAppointment.id,
      data: {
        staffId: selectedStaff.id,
        status: AppointmentStatus.CONFIRMED
      }
    }));

    setShowStaffDialog(false);
  };

  const handleConfirmAppointment = () => {
    if (preferredStaff && preferredStaff.length > 0) {
      setShowStaffDialog(true);
    } else {
      if (onStatusUpdate) {
        onStatusUpdate(AppointmentStatus.CONFIRMED);
      } else {
        toast.success("Appointment confirmed!");
      }
    }
  };

  const handleCompleteAppointment = () => {
    setShowBillingDialog(true);
  };

  const handleAppointmentCompletion = (completionData: any) => {
    // Calculate subtotal from billing items (sum of quantity * unitPrice)
    const subtotal = completionData.billingItems.reduce((sum: number, item: any) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + itemSubtotal;
    }, 0);

    // Calculate total discount amount from billing items
    const discountAmount = completionData.billingItems.reduce((sum: number, item: any) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubtotal * (item.discount / 100);
      return sum + itemDiscount;
    }, 0);

    // Get appointment ID from original appointment or use the id prop
    // For history items, use appointmentId field; for regular appointments, use id
    const appointmentId = _originalAppointment?.appointmentId || _originalAppointment?.id || id;

    // Get client email from original appointment if available
    const clientEmail = _originalAppointment?.clientEmail || `${patientName.toLowerCase().replace(/\s+/g, '.')}@example.com`;

    const billData = {
      appointmentId: appointmentId,
      patientName,
      patientImage,
      service: service || type,
      date,
      time,
      staff,
      billingItems: completionData.billingItems.map((item: any) => ({
        id: item.id,
        type: item.type,
        serviceId: item.serviceId, // Preserve serviceId for services
        productId: item.productId, // Preserve productId for products
        variantId: item.variantId, // Preserve variantId for product variants
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        unit: item.unit,
        total: (item.quantity * item.unitPrice) * (1 - (item.discount || 0) / 100)
      })),
      subtotal: subtotal,
      discountAmount: discountAmount,
      finalAmount: completionData.totalAmount,
      generatedAt: new Date().toISOString(),
      billNumber: `BILL-${Date.now()}`
    };
    
    setLastGeneratedBill(billData);
    
    // Update appointment status to completed with completion data
    if (onStatusUpdate) {
      onStatusUpdate(AppointmentStatus.COMPLETED, completionData);
    }
    
    toast.success(`Appointment completed! Bill generated for ${formatCurrency(completionData.totalAmount)}`);
    
    // Show bill preview after a short delay
    setTimeout(() => {
      setShowBillPreview(true);
    }, 500);
    
    console.log("Completion & Billing data:", completionData);
    console.log("Bill data:", billData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleCancelAppointment = () => {
    if (onStatusUpdate) {
      onStatusUpdate(AppointmentStatus.CANCELLED);
    } else {
      toast.error("Appointment cancelled");
    }
  };

  const handleStartSession = () => {
    if (onStatusUpdate) {
      onStatusUpdate(AppointmentStatus.IN_PROGRESS);
    } else {
      toast.success("Session started! Appointment is now in progress.");
    }
  };

  const handleReschedule = () => {
    toast.info("Reschedule functionality would open here");
    // Here you would open a reschedule dialog
  };

  return (
    <>
      <StaffAssignmentDialog
        open={showStaffDialog}
        onOpenChange={setShowStaffDialog}
        preferredStaff={preferredStaff || []}
        patientName={patientName}
        appointmentDate={formatDate(date)} // formatDate from utils formats as "Jan 9, 2026"
        appointmentTime={time}
        assignedStaff={staff ? {
          id: (staff as any).id || '',
          name: staff.name,
          image: staff.image,
          specialization: staff.specialization
        } : null}
        onAssignStaff={handleStaffAssignment}
      />

      <AppointmentBillingDialog
        open={showBillingDialog}
        onOpenChange={setShowBillingDialog}
        appointment={{
          id: _originalAppointment?.id || id,
          clientName: patientName,
          clientEmail: _originalAppointment?.clientEmail || `${patientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          clientPhone: phone,
          clientAvatar: patientImage,
          service: service || type,
          serviceId: _originalAppointment?.serviceId,
          servicePrice: _originalAppointment?.servicePrice || _originalAppointment?.price || 0,
          provider: typeof staff === 'string' ? staff : staff?.name || "Staff Member",
          date,
          time,
          duration: _originalAppointment?.duration ? parseInt(duration) || _originalAppointment.duration : 60,
          status: status as "confirmed" | "completed" | "cancelled" | "no-show",
          notes: _originalAppointment?.notes || "",
          location: location || "Clinic"
        }}
        onComplete={handleAppointmentCompletion}
      />

      <BillPreviewDialog
        open={showBillPreview}
        onOpenChange={setShowBillPreview}
        appointmentId={_originalAppointment?.appointmentId || _originalAppointment?.id || id}
        billData={lastGeneratedBill || undefined}
      />

      <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
        {/* First Row: User Image, Details, Status and Menu */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="w-12 h-12 sm:w-16 sm:h-16 ring-2 ring-[var(--accent-border)] flex-shrink-0">
            <AvatarImage src={patientImage} />
            <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">{patientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="font-semibold text-foreground text-lg truncate">{patientName}</h3>
            <p className="text-muted-foreground text-sm truncate">{service || type}</p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border-border" align="end">
                {isStatus(status, AppointmentStatus.PENDING) && (
                  <>
                    <DropdownMenuItem onClick={handleConfirmAppointment}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Appointment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleReschedule}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleCancelAppointment} className="text-red-600 dark:text-red-400">
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Appointment
                    </DropdownMenuItem>
                  </>
                )}
                {isStatus(status, AppointmentStatus.CONFIRMED) && (
                  <>
                    <DropdownMenuItem onClick={handleStartSession}>
                      <Play className="w-4 h-4 mr-2" />
                      Start Session
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleReschedule}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleCancelAppointment} className="text-red-600 dark:text-red-400">
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Appointment
                    </DropdownMenuItem>
                  </>
                )}
                {isStatus(status, AppointmentStatus.IN_PROGRESS) && (
                  <>
                    <DropdownMenuItem onClick={handleCompleteAppointment} className="text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4 mr-2" />
                      Complete Appointment
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="w-4 h-4 mr-2" />
                      Add Notes
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleCancelAppointment} className="text-red-600 dark:text-red-400">
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Session
                    </DropdownMenuItem>
                  </>
                )}
                {isStatus(status, AppointmentStatus.COMPLETED) && (
                  <>
                    <DropdownMenuItem onClick={() => {
                      // BillPreviewDialog will fetch real data from database using appointmentId
                      // Only use lastGeneratedBill if it exists (for newly completed appointments)
                      setShowBillPreview(true);
                    }}>
                      <Receipt className="w-4 h-4 mr-2" />
                      View Bill
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </DropdownMenuItem>
                  </>
                )}
                {isStatus(status, AppointmentStatus.CANCELLED) && (
                  <>
                    <DropdownMenuItem onClick={handleReschedule}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Reason
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-red-600 dark:text-red-400">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Appointment
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Badge className={`${getStatusColor(status)} border text-xs px-2 py-0.5`}>
              {getStatusDisplay(status)}
            </Badge>
          </div>
        </div>

        {/* Conditional Layout Based on View Mode */}
        {viewMode === 'list' ? (
          /* List View: Staff on Right Side to Utilize Space */
          <div className="flex flex-col lg:flex-row lg:gap-6">
            {/* Left Side: Appointment Details */}
            <div className="flex-1 min-w-0">
              <div className="space-y-3 mb-4 lg:mb-0">
                {/* Date */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                  <span className="text-foreground font-medium"><DateDisplay date={date} /></span>
                </div>
                
                {/* Time */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                  <span className="text-foreground font-medium">{time}</span>
                  <span className="text-muted-foreground">({duration})</span>
                </div>
                
                {/* Contact */}
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                  <span className="text-muted-foreground">{phone}</span>
                </div>
                
                {/* Location/Space */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                  <span className="text-muted-foreground">{location}</span>
                </div>
              </div>
            </div>

            {/* Right Side: Staff Information (Desktop/Tablet) */}
            {(staff || preferredStaff) && (
              <div className="lg:w-64 lg:flex-shrink-0 mt-4 lg:mt-0">
                <div className={`p-4 rounded-lg border lg:h-full lg:flex lg:flex-col lg:justify-center ${
                  staff 
                    ? 'bg-[var(--glass-bg)] border-[var(--glass-border)]' 
                    : 'bg-[var(--accent-bg)] border-[var(--accent-border)]'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {staff ? 'Assigned Staff:' : 'Preferred Staff:'}
                    </span>
                  </div>
                  
                  {staff ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={staff.image} />
                        <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-sm">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{staff.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{staff.specialization}</p>
                      </div>
                      
                      {/* Dropdown for preferred staff - show when staff is assigned and there are preferred staff */}
                      {preferredStaff && preferredStaff.length > 0 && (
                        <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                          <Popover open={showPreferredStaffDropdown} onOpenChange={setShowPreferredStaffDropdown}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-accent"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent 
                              className={`${isMobile ? 'w-[calc(100vw-2rem)] max-w-sm' : 'w-80'} p-2 bg-popover border-border`} 
                              align={isMobile ? "center" : "end"}
                            >
                              <div className="space-y-1">
                                {/* Show assigned staff first */}
                                <div 
                                  className="group flex items-center gap-3 p-2 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]"
                                >
                                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                                    <CheckCircle className="w-4 h-4" />
                                  </div>
                                  <Avatar className="w-8 h-8 flex-shrink-0">
                                    <AvatarImage src={staff.image} />
                                    <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
                                      {staff.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">{staff.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{staff.specialization}</p>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Assigned</p>
                                  </div>
                                </div>
                                
                                {/* Show preferred staff below */}
                                {preferredStaff.map((staffMember, index) => {
                                  // Skip if this preferred staff is the same as assigned staff
                                  const isSameStaff = (staffMember.id && (staff as any).id && staffMember.id === (staff as any).id) || 
                                                     staffMember.name === staff.name;
                                  if (isSameStaff) {
                                    return null;
                                  }
                                  return (
                                    <div 
                                      key={index} 
                                      className="group flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--accent-bg)] transition-colors cursor-pointer"
                                      onClick={() => {
                                        if (isStatus(status, AppointmentStatus.PENDING)) {
                                          handleStaffAssignment(staffMember);
                                          setShowPreferredStaffDropdown(false);
                                        }
                                      }}
                                    >
                                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                                        {index + 1}
                                      </div>
                                      <Avatar className="w-8 h-8 flex-shrink-0">
                                        <AvatarImage src={staffMember.image} />
                                        <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
                                          {staffMember.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{staffMember.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{staffMember.specialization}</p>
                                      </div>
                                      {isStatus(status, AppointmentStatus.PENDING) && (
                                        <Button
                                          size="sm"
                                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)] text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStaffAssignment(staffMember);
                                            setShowPreferredStaffDropdown(false);
                                          }}
                                        >
                                          Assign
                                        </Button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </div>
                  ) : preferredStaff && preferredStaff.length > 0 && (
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={preferredStaff[0].image} />
                        <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-sm">
                          {preferredStaff[0].name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{preferredStaff[0].name}</p>
                        <p className="text-xs text-muted-foreground truncate">{preferredStaff[0].specialization}</p>
                      </div>
                      
                      {/* Dropdown for preferred staff - always show when there are preferred staff */}
                      <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                        <Popover open={showPreferredStaffDropdown} onOpenChange={setShowPreferredStaffDropdown}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-accent"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent 
                            className={`${isMobile ? 'w-[calc(100vw-2rem)] max-w-sm' : 'w-80'} p-2 bg-popover border-border`} 
                            align={isMobile ? "center" : "end"}
                          >
                            <div className="space-y-1">
                              {preferredStaff.map((staffMember, index) => (
                                <div 
                                  key={index} 
                                  className="group flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--accent-bg)] transition-colors cursor-pointer"
                                  onClick={() => {
                                    if (isStatus(status, AppointmentStatus.PENDING)) {
                                      handleStaffAssignment(staffMember);
                                      setShowPreferredStaffDropdown(false);
                                    }
                                  }}
                                >
                                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <Avatar className="w-8 h-8 flex-shrink-0">
                                    <AvatarImage src={staffMember.image} />
                                    <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
                                      {staffMember.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">{staffMember.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{staffMember.specialization}</p>
                                  </div>
                                  {isStatus(status, AppointmentStatus.PENDING) && (
                                    <Button
                                      size="sm"
                                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)] text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStaffAssignment(staffMember);
                                        setShowPreferredStaffDropdown(false);
                                      }}
                                    >
                                      Assign
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Card View: Traditional Vertical Layout */
          <>
            {/* Second Row: Date, Time, Contact, Location - Each on separate lines */}
            <div className="space-y-3 mb-4">
              {/* Date */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                <span className="text-foreground font-medium">{formatDate(date)}</span>
              </div>
              
              {/* Time */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                <span className="text-foreground font-medium">{time}</span>
                <span className="text-muted-foreground">({duration})</span>
              </div>
              
              {/* Contact */}
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                <span className="text-muted-foreground">{phone}</span>
              </div>
              
              {/* Location/Space */}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                <span className="text-muted-foreground">{location}</span>
              </div>
            </div>

            {/* Third Row: Staff Information */}
            {(staff || preferredStaff) && (
              <div className={`p-4 rounded-lg border ${
                staff 
                  ? 'bg-[var(--glass-bg)] border-[var(--glass-border)]' 
                  : 'bg-[var(--accent-bg)] border-[var(--accent-border)]'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    {staff ? 'Assigned Staff:' : 'Preferred Staff:'}
                  </span>
                </div>
                
                {staff ? (
                  /* Assigned Staff */
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={staff.image} />
                      <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-sm">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{staff.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{staff.specialization}</p>
                    </div>
                    
                    {/* Dropdown for preferred staff - show when staff is assigned and there are preferred staff */}
                    {preferredStaff && preferredStaff.length > 0 && (
                      <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                        <Popover open={showPreferredStaffDropdown} onOpenChange={setShowPreferredStaffDropdown}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-accent"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-2 bg-popover border-border" align="end">
                            <div className="space-y-1">
                              {/* Show assigned staff first */}
                              <div 
                                className="group flex items-center gap-3 p-2 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]"
                              >
                                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                  <AvatarImage src={staff.image} />
                                  <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
                                    {staff.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">{staff.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{staff.specialization}</p>
                                  <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Assigned</p>
                                </div>
                              </div>
                              
                              {/* Show preferred staff below */}
                              {preferredStaff.map((staffMember, index) => {
                                // Skip if this preferred staff is the same as assigned staff
                                if (staffMember.id === staff.id || staffMember.name === staff.name) {
                                  return null;
                                }
                                return (
                                  <div 
                                    key={index} 
                                    className="group flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--accent-bg)] transition-colors cursor-pointer"
                                    onClick={() => {
                                      if (isStatus(status, AppointmentStatus.PENDING)) {
                                        handleStaffAssignment(staffMember);
                                        setShowPreferredStaffDropdown(false);
                                      }
                                    }}
                                  >
                                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                                      {index + 1}
                                    </div>
                                    <Avatar className="w-8 h-8 flex-shrink-0">
                                      <AvatarImage src={staffMember.image} />
                                      <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
                                        {staffMember.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground">{staffMember.name}</p>
                                      <p className="text-xs text-muted-foreground truncate">{staffMember.specialization}</p>
                                    </div>
                                    {isStatus(status, AppointmentStatus.PENDING) && (
                                      <Button
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)] text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStaffAssignment(staffMember);
                                          setShowPreferredStaffDropdown(false);
                                        }}
                                      >
                                        Assign
                                      </Button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                ) : preferredStaff && preferredStaff.length > 0 && (
                  /* Preferred Staff */
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={preferredStaff[0].image} />
                      <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-sm">
                        {preferredStaff[0].name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{preferredStaff[0].name}</p>
                      <p className="text-xs text-muted-foreground truncate">{preferredStaff[0].specialization}</p>
                    </div>
                    
                    {/* Dropdown for preferred staff - always show when there are preferred staff */}
                    <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                      <Popover open={showPreferredStaffDropdown} onOpenChange={setShowPreferredStaffDropdown}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-accent"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-2 bg-popover border-border" align="end">
                          <div className="space-y-1">
                            {preferredStaff.map((staffMember, index) => (
                              <div 
                                key={index} 
                                className="group flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--accent-bg)] transition-colors cursor-pointer"
                                onClick={() => {
                                  if (isStatus(status, AppointmentStatus.PENDING)) {
                                    handleStaffAssignment(staffMember);
                                    setShowPreferredStaffDropdown(false);
                                  }
                                }}
                              >
                                <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                                  {index + 1}
                                </div>
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                  <AvatarImage src={staffMember.image} />
                                  <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
                                    {staffMember.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">{staffMember.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{staffMember.specialization}</p>
                                </div>
                                {isStatus(status, AppointmentStatus.PENDING) && (
                                  <Button
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)] text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStaffAssignment(staffMember);
                                      setShowPreferredStaffDropdown(false);
                                    }}
                                  >
                                    Assign
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Card>
    </>
  );
}