import { useState } from "react";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { CheckCircle, Users, Star, X } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  image?: string;
  specialization: string;
}

interface StaffAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferredStaff: StaffMember[];
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  assignedStaff?: StaffMember | null;
  onAssignStaff?: (staffMember: StaffMember) => void;
}

export function StaffAssignmentDialog({
  open,
  onOpenChange,
  preferredStaff,
  patientName,
  appointmentDate,
  appointmentTime,
  assignedStaff,
  onAssignStaff
}: StaffAssignmentDialogProps) {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const handleStaffSelection = (staff: StaffMember) => {
    setSelectedStaff(staff);
  };

  const handleConfirmAssignment = () => {
    if (selectedStaff && onAssignStaff) {
      onAssignStaff(selectedStaff);
    }
    onOpenChange(false);
    setSelectedStaff(null);
  };

  return (
    <CustomDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="Assign Staff Member"
      description={`Assign a staff member for ${patientName}'s appointment on ${appointmentDate} at ${appointmentTime}`}
    >
      <div className="space-y-6">
        {/* Appointment Details */}
        <div className="p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-[var(--accent-text)]" />
            <h3 className="font-medium text-foreground">Appointment Details</h3>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-foreground"><span className="text-muted-foreground">Patient:</span> {patientName}</p>
            <p className="text-foreground"><span className="text-muted-foreground">Date:</span> {appointmentDate}</p>
            <p className="text-foreground"><span className="text-muted-foreground">Time:</span> {appointmentTime}</p>
          </div>
        </div>

        {/* Staff Selection */}
        <div>
          <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-[var(--accent-text)]" />
            {assignedStaff ? 'Assigned & Preferred Staff Members' : 'Available Staff Members'}
          </h3>
          
          {/* Show assigned staff first if exists */}
          {assignedStaff && (
            <div className="mb-4">
              <Card className="p-4 bg-[var(--accent-bg)] border-2 border-[var(--accent-border)] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={assignedStaff.image} alt={assignedStaff.name} />
                    <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
                      {assignedStaff.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground">{assignedStaff.name}</h4>
                          <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 text-xs">
                            Assigned
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{assignedStaff.specialization}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Preferred Staff Dropdown */}
          {preferredStaff.length > 0 ? (
            <div className="space-y-3">
              {preferredStaff.map((staff, index) => {
                // Skip if this preferred staff is the same as assigned staff
                const isAssignedStaff = assignedStaff && (
                  (staff.id && assignedStaff.id && staff.id === assignedStaff.id) ||
                  staff.name === assignedStaff.name
                );
                
                if (isAssignedStaff) {
                  return null;
                }
                
                return (
                <Card 
                  key={index}
                  className={`p-4 cursor-pointer transition-all duration-200 border backdrop-blur-xl ${
                    selectedStaff?.name === staff.name 
                      ? 'ring-2 ring-[var(--accent-primary)] bg-[var(--accent-bg)] border-[var(--accent-border)]' 
                      : 'bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)]'
                  }`}
                  onClick={() => handleStaffSelection(staff)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={staff.image} alt={staff.name} />
                      <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">{staff.name}</h4>
                          <p className="text-sm text-muted-foreground">{staff.specialization}</p>
                        </div>
                        {selectedStaff?.name === staff.name && (
                          <CheckCircle className="w-5 h-5 text-[var(--accent-text)]" />
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium text-foreground mb-2">No Staff Available</h4>
              <p className="text-muted-foreground text-sm">
                No staff members are currently available for this appointment time.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-[var(--glass-border)]">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedStaff(null);
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAssignment}
            disabled={!selectedStaff}
            className="flex-1 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)]"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Assign Staff
          </Button>
        </div>
      </div>
    </CustomDialog>
  );
}