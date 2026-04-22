import { MoreVertical, CheckCircle, XCircle, Eye, FileText, RotateCcw, Play, Check, Receipt, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AppointmentStatus } from "@/types/appointmentStatus";

interface AppointmentCardHeaderProps {
  patientName: string;
  patientImage?: string;
  service?: string;
  type: string;
  status: AppointmentStatus | string;
  hasServiceEntity: boolean;
  getStatusColor: (status: string | number) => string;
  getStatusDisplay: (status: string | number) => string;
  isStatus: (status: string | number, enumValue: AppointmentStatus) => boolean;
  handleConfirmAppointment: () => void;
  handleCompleteAppointment: () => void;
  handleCancelAppointment: () => void;
  handleStartSession: () => void;
  handleReschedule: () => void;
  canConfirmAppointment: boolean;
  onViewBill?: () => void;
  onViewDetails?: () => void;
  onDelete?: () => void;
  onCardClick: (e: React.MouseEvent) => void;
  isCompact?: boolean;
}

export const AppointmentCardHeader = ({
  patientName,
  patientImage,
  service,
  type,
  status,
  hasServiceEntity,
  getStatusColor,
  getStatusDisplay,
  isStatus,
  handleConfirmAppointment,
  handleCompleteAppointment,
  handleCancelAppointment,
  handleStartSession,
  handleReschedule,
  canConfirmAppointment,
  onViewBill,
  onViewDetails,
  onDelete,
  onCardClick,
  isCompact = false
}: AppointmentCardHeaderProps) => {
  // Compact mode: only show dropdown menu button (for top-right corner)
  if (isCompact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20" 
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-popover border-border" align="end" onClick={(e) => e.stopPropagation()}>
          {isStatus(status, AppointmentStatus.PENDING) && (
            <>
              {canConfirmAppointment && (
                <DropdownMenuItem onClick={handleConfirmAppointment}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Appointment
                </DropdownMenuItem>
              )}
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
              <DropdownMenuItem onClick={onViewDetails}>
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
              <DropdownMenuItem onClick={onViewBill}>
                <Receipt className="w-4 h-4 mr-2" />
                View Bill
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onViewDetails}>
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
    );
  }

  // Full mode: show avatar, name, and dropdown (for list view)
  return (
    <div className="flex items-start gap-3 mb-3">
      <Avatar className="w-12 h-12 sm:w-16 sm:h-16 ring-2 ring-[var(--accent-border)] flex-shrink-0">
        <AvatarImage src={patientImage} />
        <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">{patientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 mr-2">
        <h3 className="font-semibold text-foreground text-lg truncate">{patientName}</h3>
        {hasServiceEntity && (
          <p className="text-muted-foreground text-sm truncate">{service || type}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-popover border-border" align="end" onClick={(e) => e.stopPropagation()}>
            {isStatus(status, AppointmentStatus.PENDING) && (
              <>
                {canConfirmAppointment && (
                  <DropdownMenuItem onClick={handleConfirmAppointment}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Appointment
                  </DropdownMenuItem>
                )}
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
                <DropdownMenuItem onClick={onViewDetails}>
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
                <DropdownMenuItem onClick={onViewBill}>
                  <Receipt className="w-4 h-4 mr-2" />
                  View Bill
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewDetails}>
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
  );
};
