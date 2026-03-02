import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { StaffAssignmentDialog } from "../../staff";
import { AppointmentBillingDialog } from "../AppointmentBillingDialog";
import { BillPreviewDialog } from "../../../components/BillPreviewDialog";
import { formatDate } from "../../../utils";
import { toast } from "sonner";
import { AppointmentStatus, normalizeAppointmentStatus, getAppointmentStatusLabel } from "../../../types/appointmentStatus";
import { useAppDispatch } from "../../../store/hooks";
import { updateAppointmentRequest } from "../../../store/slices/appointmentsSlice";
import { AppointmentCardProps } from "./types";
import { AppointmentCardHeader } from "./components/AppointmentCardHeader";
import { AppointmentCardView } from "./AppointmentCardView";
import { AppointmentListView } from "./AppointmentListView";

const formatCurrency = (amount: number) => `${amount.toFixed(2)}`;

export const AppointmentCard = ({ 
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
  _originalAppointment,
  selectedEntities
}: AppointmentCardProps) => {
  // Check which entities are enabled
  const hasServiceEntity = !selectedEntities || selectedEntities.includes('service');
  const hasStaffEntity = !selectedEntities || selectedEntities.includes('staff');
  const hasSpaceEntity = !selectedEntities || selectedEntities.includes('space');
  const dispatch = useAppDispatch();
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [showBillingDialog, setShowBillingDialog] = useState(false);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [lastGeneratedBill, setLastGeneratedBill] = useState<any>(null);
  const navigate = useNavigate();

  // Get all available staff for Select component
  const getAllAvailableStaff = () => {
    const staffList: Array<{ id: string; name: string; image?: string; specialization: string; isAssigned?: boolean }> = [];
    
    // Add assigned staff first if exists
    if (staff) {
      staffList.push({
        id: (staff as any).id || staff.name,
        name: staff.name,
        image: staff.image,
        specialization: staff.specialization,
        isAssigned: true
      });
    }
    
    // Add preferred staff (excluding already assigned)
    if (preferredStaff && preferredStaff.length > 0) {
      preferredStaff.forEach((staffMember) => {
        const isSameStaff = (staffMember.id && staff && (staff as any).id && staffMember.id === (staff as any).id) || 
                           (staff && staffMember.name === staff.name);
        if (!isSameStaff) {
          staffList.push({
            id: staffMember.id || staffMember.name,
            name: staffMember.name,
            image: staffMember.image,
            specialization: staffMember.specialization,
            isAssigned: false
          });
        }
      });
    }
    
    return staffList;
  };

  const availableStaff = getAllAvailableStaff();
  const currentStaffId = staff ? ((staff as any).id || staff.name) : (preferredStaff && preferredStaff.length > 0 ? (preferredStaff[0].id || preferredStaff[0].name) : "");

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
        serviceId: item.serviceId,
        productId: item.productId,
        variantId: item.variantId,
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
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on dropdown menu, buttons, or interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('[role="menuitem"]') || 
      target.closest('[data-radix-popper-content-wrapper]') ||
      target.closest('[role="dialog"]') ||
      target.closest('.popover-content')
    ) {
      return;
    }
    
    // Navigate to appointment detail page
    navigate(`/system/appointments/${id}`);
  };

  return (
    <>
      <StaffAssignmentDialog
        open={showStaffDialog}
        onOpenChange={setShowStaffDialog}
        preferredStaff={preferredStaff || []}
        patientName={patientName}
        appointmentDate={formatDate(date)}
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

      <Card 
        className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)] cursor-pointer"
        onClick={handleCardClick}
      >
        <AppointmentCardHeader
          patientName={patientName}
          patientImage={patientImage}
          service={service}
          type={type}
          status={status}
          hasServiceEntity={hasServiceEntity}
          getStatusColor={getStatusColor}
          getStatusDisplay={getStatusDisplay}
          isStatus={isStatus}
          handleConfirmAppointment={handleConfirmAppointment}
          handleCompleteAppointment={handleCompleteAppointment}
          handleCancelAppointment={handleCancelAppointment}
          handleStartSession={handleStartSession}
          handleReschedule={handleReschedule}
          onViewBill={() => setShowBillPreview(true)}
          onDelete={onDelete}
          onCardClick={handleCardClick}
        />

        {/* Conditional Layout Based on View Mode */}
        {viewMode === 'list' ? (
          <AppointmentListView
            date={date}
            time={time}
            duration={duration}
            phone={phone}
            location={location}
            hasSpaceEntity={hasSpaceEntity}
            hasStaffEntity={hasStaffEntity}
            staff={staff}
            preferredStaff={preferredStaff}
            availableStaff={availableStaff}
            currentStaffId={currentStaffId}
            handleStaffAssignment={handleStaffAssignment}
          />
        ) : (
          <AppointmentCardView
            date={date}
            time={time}
            duration={duration}
            phone={phone}
            location={location}
            hasSpaceEntity={hasSpaceEntity}
            hasStaffEntity={hasStaffEntity}
            staff={staff}
            preferredStaff={preferredStaff}
            availableStaff={availableStaff}
            currentStaffId={currentStaffId}
            handleStaffAssignment={handleStaffAssignment}
          />
        )}
      </Card>
    </>
  );
};
