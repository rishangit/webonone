import { useState, useEffect } from "react";
import { Calendar, Clock, User, MapPin, Phone, Mail, Stethoscope, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useNavigate } from "react-router-dom";
import { fetchAppointmentRequest, deleteAppointmentRequest, clearError } from "@/store/slices/appointmentsSlice";
import { fetchUserRequest } from "@/store/slices/usersSlice";
import { fetchServiceRequest } from "@/store/slices/servicesSlice";
import { fetchStaffMemberRequest } from "@/store/slices/staffSlice";
import { fetchSpaceRequest } from "@/store/slices/spacesSlice";
import { Appointment } from "@/services/appointments";
import { AppointmentStatus, normalizeAppointmentStatus, getAppointmentStatusLabel } from "@/types/appointmentStatus";
import { formatAvatarUrl } from "../../utils";
import { DateDisplay } from "@/components/common/DateDisplay";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { AppointmentBillingDialog } from "./AppointmentBillingDialog";
import { BackButton } from "@/components/common/BackButton";
import { CardTitle } from "@/components/common/CardTitle";

interface AppointmentDetailPageProps {
  appointmentId: string;
  onBack: () => void;
}

export const AppointmentDetailPage = ({ appointmentId, onBack }: AppointmentDetailPageProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentAppointment, loading, error } = useAppSelector((state) => state.appointments);
  const { currentUser: clientUser } = useAppSelector((state) => state.users);
  const { currentService } = useAppSelector((state) => state.services);
  const { currentStaff } = useAppSelector((state) => state.staff);
  const { currentSpace } = useAppSelector((state) => state.spaces);

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBillingDialog, setShowBillingDialog] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLocalLoading(true);
        dispatch(fetchAppointmentRequest(appointmentId));
      } catch (error: any) {
        console.error('Error fetching appointment:', error);
        toast.error(error.message || 'Failed to load appointment details');
      } finally {
        setLocalLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, dispatch]);

  // Use Redux currentAppointment if available and matches
  useEffect(() => {
    if (currentAppointment && currentAppointment.id === appointmentId) {
      setAppointment(currentAppointment);
      
      // Fetch related data
      if (currentAppointment.clientId) {
        dispatch(fetchUserRequest(currentAppointment.clientId));
      }
      if (currentAppointment.serviceId) {
        dispatch(fetchServiceRequest(currentAppointment.serviceId));
      }
      if (currentAppointment.staffId) {
        dispatch(fetchStaffMemberRequest(currentAppointment.staffId));
      }
      if (currentAppointment.spaceId) {
        dispatch(fetchSpaceRequest(currentAppointment.spaceId));
      }
    }
  }, [currentAppointment, appointmentId, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleDelete = async () => {
    if (!appointment) return;
    
    try {
      setDeleting(true);
      dispatch(deleteAppointmentRequest(appointment.id));
      toast.success("Appointment deleted successfully");
      onBack();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete appointment");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

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

  if (localLoading || loading) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Appointment Not Found</h3>
          <p className="text-muted-foreground mb-4">The appointment you're looking for doesn't exist.</p>
          <BackButton onClick={onBack} label="Back to Appointments" />
        </div>
      </div>
    );
  }

  const clientName = clientUser 
    ? `${clientUser.firstName || ''} ${clientUser.lastName || ''}`.trim() || clientUser.name || 'Unknown Client'
    : 'Unknown Client';
  const clientEmail = clientUser?.email || 'N/A';
  const clientPhone = clientUser?.phone || 'N/A';
  const clientAvatar = clientUser?.avatar;

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton onClick={onBack} />
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Appointment Details</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--accent-text)]" />
              <DateDisplay date={appointment.date} className="text-sm" />
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`${getStatusColor(appointment.status)} border font-medium`}>
            {getStatusDisplay(appointment.status)}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/system/appointments/${appointment.id}/edit`)}
            className="border-[var(--accent-border)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-text)] transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
            <CardTitle title="Client Information" icon={User} />
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16 ring-2 ring-[var(--accent-border)] ring-offset-2 ring-offset-background">
                <AvatarImage src={formatAvatarUrl(clientAvatar, clientUser?.firstName, clientUser?.lastName)} />
                <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] font-semibold">
                  {clientName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="font-semibold text-foreground text-lg">{clientName}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                  <span className="text-muted-foreground">{clientEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                  <span className="text-muted-foreground">{clientPhone}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Appointment Details */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
            <CardTitle title="Appointment Details" icon={Calendar} />
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                <span className="text-muted-foreground">Date:</span>
                <span className="text-foreground font-medium">
                  <DateDisplay date={appointment.date} />
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                <span className="text-muted-foreground">Time:</span>
                <span className="text-foreground font-medium">{appointment.time}</span>
              </div>
              {appointment.duration && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="text-foreground font-medium">{appointment.duration} minutes</span>
                </div>
              )}
              {appointment.type && (
                <div className="flex items-center gap-2 text-sm">
                  <Stethoscope className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                  <span className="text-muted-foreground">Type:</span>
                  <span className="text-foreground font-medium">{appointment.type}</span>
                </div>
              )}
              {appointment.priority && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge variant="outline" className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                    {appointment.priority}
                  </Badge>
                </div>
              )}
              {appointment.price && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="text-foreground font-semibold text-[var(--accent-text)]">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(appointment.price)}
                  </span>
                </div>
              )}
              {appointment.paymentStatus && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <Badge variant="outline" className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                    {appointment.paymentStatus}
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Service Information */}
          {appointment.serviceId && currentService && (
            <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
              <CardTitle title="Service" icon={Stethoscope} />
              <div>
                <p className="font-semibold text-foreground text-lg">{currentService.name}</p>
                {currentService.description && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{currentService.description}</p>
                )}
              </div>
            </Card>
          )}

          {/* Staff Information */}
          {appointment.staffId && currentStaff && (
            <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
              <CardTitle title="Assigned Staff" icon={User} />
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-[var(--accent-border)] ring-offset-2 ring-offset-background">
                  <AvatarImage src={formatAvatarUrl(currentStaff.avatar, currentStaff.firstName, currentStaff.lastName)} />
                  <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] font-semibold">
                    {`${currentStaff.firstName?.[0] || ''}${currentStaff.lastName?.[0] || ''}`}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">
                    {currentStaff.firstName || ''} {currentStaff.lastName || ''}
                  </p>
                  {currentStaff.role && (
                    <p className="text-sm text-muted-foreground mt-0.5">{currentStaff.role}</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Space Information */}
          {appointment.spaceId && currentSpace && (
            <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
              <CardTitle title="Location" icon={MapPin} />
              <div>
                <p className="font-semibold text-foreground text-lg">{currentSpace.name}</p>
                {currentSpace.description && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{currentSpace.description}</p>
                )}
              </div>
            </Card>
          )}

          {/* Notes */}
          {appointment.notes && (
            <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
              <CardTitle title="Notes" />
              <div className="p-4 rounded-lg bg-[var(--accent-bg)]/30 border border-[var(--accent-border)]/30">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{appointment.notes}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
            <CardTitle title="Quick Actions" />
            <div className="space-y-2">
              {normalizeAppointmentStatus(appointment.status) === AppointmentStatus.COMPLETED && (
                <Button
                  variant="outline"
                  className="w-full border-[var(--accent-border)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-text)] transition-colors"
                  onClick={() => setShowBillingDialog(true)}
                >
                  View Billing
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full border-[var(--accent-border)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-text)] transition-colors"
                onClick={() => navigate(`/system/users/${appointment.clientId}`)}
              >
                View Client Profile
              </Button>
            </div>
          </Card>

          {/* Additional Information */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
            <CardTitle title="Additional Information" />
            <div className="space-y-4 text-sm">
              {appointment.createdAt && (
                <div className="pb-3 border-b border-[var(--glass-border)]">
                  <span className="text-muted-foreground block mb-1">Created:</span>
                  <p className="text-foreground font-medium">
                    <DateDisplay date={appointment.createdAt} />
                  </p>
                </div>
              )}
              {appointment.updatedAt && (
                <div className="pb-3 border-b border-[var(--glass-border)]">
                  <span className="text-muted-foreground block mb-1">Last Updated:</span>
                  <p className="text-foreground font-medium">
                    <DateDisplay date={appointment.updatedAt} />
                  </p>
                </div>
              )}
              {appointment.reminderSent !== undefined && (
                <div>
                  <span className="text-muted-foreground block mb-1">Reminder Sent:</span>
                  <Badge variant="outline" className={`${appointment.reminderSent ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]' : ''}`}>
                    {appointment.reminderSent ? 'Yes' : 'No'}
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Appointment"
        description={`Are you sure you want to delete this appointment? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleting}
      />

      {/* Billing Dialog */}
      {appointment && (
        <AppointmentBillingDialog
          open={showBillingDialog}
          onOpenChange={setShowBillingDialog}
          appointment={{
            id: appointment.id,
            clientName,
            clientEmail,
            clientPhone,
            clientAvatar,
            service: currentService?.name || appointment.type || 'Service',
            serviceId: appointment.serviceId,
            servicePrice: appointment.price || 0,
            provider: currentStaff ? `${currentStaff.firstName || ''} ${currentStaff.lastName || ''}`.trim() : 'Staff Member',
            date: appointment.date,
            time: appointment.time,
            duration: appointment.duration || 60,
            status: appointment.status as any,
            location: currentSpace?.name || 'Location'
          }}
          onComplete={() => {
            setShowBillingDialog(false);
            toast.success("Appointment billing updated");
          }}
        />
      )}
    </div>
  );
};
