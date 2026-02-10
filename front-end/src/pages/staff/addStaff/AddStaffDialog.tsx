import { useState, useEffect } from "react";
import { CustomDialog } from "../../../components/ui/custom-dialog";
import { Button } from "../../../components/ui/button";
import { UserPlus, Users, Settings, CheckCircle, ChevronLeft, ChevronRight, Clock, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "../../../store/hooks";
import { AddStaffDialogProps, UserForSelection } from "./types";
import { daysOfWeek } from "./constants";
import { UserSearchSection } from "./UserSearchSection";
import { SelectedUserSummary } from "./SelectedUserSummary";
import { WorkScheduleSection } from "./WorkScheduleSection";
import { PermissionsSection } from "./PermissionsSection";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { formatAvatarUrl } from "../../../utils";

export const AddStaffDialog = ({
  open,
  onOpenChange,
  onAddStaff,
  editingStaff,
  onEditStaff,
  companyId
}: AddStaffDialogProps) => {
  const { users: reduxUsers } = useAppSelector((state) => state.users);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserForSelection | null>(null);
  const [permissions, setPermissions] = useState<string[]>(["appointments:read"]);

  // Wizard steps
  const steps = [
    { id: "user", title: "Select User", icon: Users },
    { id: "configuration", title: "Staff Configuration", icon: Settings },
    { id: "summary", title: "Summary", icon: CheckCircle }
  ];

  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  // Work schedule state
  const [workSchedule, setWorkSchedule] = useState<Record<string, { startTime: string; endTime: string; enabled: boolean }>>({
    monday: { startTime: "09:00", endTime: "17:00", enabled: true },
    tuesday: { startTime: "09:00", endTime: "17:00", enabled: true },
    wednesday: { startTime: "09:00", endTime: "17:00", enabled: true },
    thursday: { startTime: "09:00", endTime: "17:00", enabled: true },
    friday: { startTime: "09:00", endTime: "17:00", enabled: true },
    saturday: { startTime: "09:00", endTime: "17:00", enabled: false },
    sunday: { startTime: "09:00", endTime: "17:00", enabled: false }
  });

  // Transform Redux users to UserForSelection format (for editing)
  const transformUsers = (users: any[]) => {
    return users.map((user: any) => {
      let roleName = "User";
      if (user.roles && user.roles.length > 0) {
        const nonUserRole = user.roles.find((r: any) => r.role !== "USER");
        const roleToUse = nonUserRole || user.roles[0];
        roleName = roleToUse.role || "User";
      } else if (user.role !== null && user.role !== undefined) {
        roleName = user.role;
      }

      return {
        id: user.id,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: roleName,
        status: (user.isActive !== false ? 'active' : 'inactive') as 'active' | 'inactive' | 'pending',
        location: user.address,
        address: user.address,
        createdAt: user.createdAt,
      };
    });
  };

  // Preserve selected user when reduxUsers changes (pagination) - CRITICAL: Don't reset selection
  // This effect only updates the selectedUser object reference if the user appears in new Redux data
  // It does NOT clear the selection if the user is not in the current page's data
  useEffect(() => {
    if (selectedUser && reduxUsers.length > 0) {
      const updatedUser = reduxUsers.find(u => u.id === selectedUser.id);
      if (updatedUser) {
        // User found in new Redux data - update the reference to keep it in sync
        const transformed = transformUsers([updatedUser])[0];
        setSelectedUser(prev => {
          if (!prev) return prev;
          // Only update if the data actually changed to avoid unnecessary re-renders
          if (JSON.stringify(transformed) !== JSON.stringify(prev)) {
            return transformed;
          }
          return prev;
        });
      }
      // If user is not in new Redux data, keep the existing selectedUser
      // This is correct because allLoadedUsers in UserSearchSection accumulates all pages
    }
  }, [reduxUsers]); // Only depend on reduxUsers - this runs when pagination adds new data

  // Initialize form when editing - CRITICAL: Only run when editingStaff or open changes
  useEffect(() => {
    if (editingStaff && open) {
      // Find the user for this staff member from Redux
      const staffUserFromRedux = reduxUsers.find(u => u.id === editingStaff.userId);
      if (staffUserFromRedux) {
        const transformed = transformUsers([staffUserFromRedux])[0];
        setSelectedUser(transformed);
      }

      // Handle permissions
      if (Array.isArray(editingStaff.permissions)) {
        setPermissions(editingStaff.permissions);
      } else if (typeof editingStaff.permissions === 'object' && editingStaff.permissions !== null) {
        setPermissions(Object.keys(editingStaff.permissions));
      } else {
        setPermissions(["appointments:read"]);
      }

      // Handle work schedule
      if (editingStaff.workSchedule) {
        if (editingStaff.workSchedule.schedule) {
          setWorkSchedule(editingStaff.workSchedule.schedule);
        } else {
          const oldStartTime = editingStaff.workSchedule.startTime || "09:00";
          const oldEndTime = editingStaff.workSchedule.endTime || "17:00";
          const oldAvailableDays = editingStaff.workSchedule.availableDays || ["monday", "tuesday", "wednesday", "thursday", "friday"];
          const newSchedule: Record<string, { startTime: string; endTime: string; enabled: boolean }> = {};
          daysOfWeek.forEach(day => {
            newSchedule[day.id] = {
              startTime: oldStartTime,
              endTime: oldEndTime,
              enabled: oldAvailableDays.includes(day.id)
            };
          });
          setWorkSchedule(newSchedule);
        }
      }
    } else if (!editingStaff && open && !selectedUser) {
      // Only reset if no user is selected (don't reset if user is already selected)
      handleReset();
    }

    // Reset step when dialog opens for new staff
    if (open && !editingStaff && currentStep > 0 && !selectedUser) {
      setCurrentStep(0);
    }
  }, [editingStaff, open]); // CRITICAL: Removed reduxUsers dependency to prevent reset on pagination

  // Reset step when dialog closes
  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
    }
  }, [open]);

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedUser(null);
    setPermissions(["appointments:read"]);
    setWorkSchedule({
      monday: { startTime: "09:00", endTime: "17:00", enabled: true },
      tuesday: { startTime: "09:00", endTime: "17:00", enabled: true },
      wednesday: { startTime: "09:00", endTime: "17:00", enabled: true },
      thursday: { startTime: "09:00", endTime: "17:00", enabled: true },
      friday: { startTime: "09:00", endTime: "17:00", enabled: true },
      saturday: { startTime: "09:00", endTime: "17:00", enabled: false },
      sunday: { startTime: "09:00", endTime: "17:00", enabled: false }
    });
  };

  // Step validation
  const isStepValid = (stepIndex: number) => {
    const step = steps[stepIndex];
    switch (step.id) {
      case "user":
        return selectedUser !== null;
      case "configuration":
        const enabledDays = Object.values(workSchedule).filter(day => day.enabled);
        return enabledDays.length > 0;
      case "summary":
        return true;
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);

  const handleNext = () => {
    if (isLastStep) {
      handleAddStaff();
    } else if (canProceed) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show validation error
      if (currentStep === 0 && !selectedUser) {
        toast.error("Please select a user to continue");
      } else if (currentStep === 1) {
        const enabledDays = Object.values(workSchedule).filter(day => day.enabled);
        if (enabledDays.length === 0) {
          toast.error("Please enable at least one work day");
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleAddStaff = () => {
    if (!selectedUser) {
      toast.error("Please select a user to add as staff member");
      return;
    }

    const enabledDays = Object.values(workSchedule).filter(day => day.enabled);
    if (enabledDays.length === 0) {
      toast.error("Please enable at least one work day");
      return;
    }

    if (editingStaff && onEditStaff) {
      onEditStaff({
        id: editingStaff.id,
        userId: selectedUser.id,
        permissions,
        workSchedule: {
          schedule: workSchedule
        }
      });
    } else {
      onAddStaff({
        userId: selectedUser.id,
        permissions,
        workSchedule: {
          schedule: workSchedule
        }
      });
    }

    handleReset();
    onOpenChange(false);
  };

  const handleDayToggle = (dayId: string) => {
    setWorkSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        enabled: !prev[dayId].enabled
      }
    }));
  };

  const handleDayTimeChange = (dayId: string, field: 'startTime' | 'endTime', value: string) => {
    setWorkSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value
      }
    }));
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setPermissions(prev => [...prev, permissionId]);
    } else {
      setPermissions(prev => prev.filter(p => p !== permissionId));
    }
  };

  // Step Indicator Component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${isCompleted
                  ? "bg-[var(--accent-primary)] text-white"
                  : isCurrent
                    ? "bg-[var(--accent-bg)] border-2 border-[var(--accent-primary)] text-[var(--accent-text)]"
                    : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-muted-foreground"
                }`}
            >
              {isCompleted ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <StepIcon className="w-4 h-4" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-2 transition-all duration-200 ${isCompleted
                    ? "bg-[var(--accent-primary)]"
                    : "bg-[var(--glass-border)]"
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // User Selection
        return (
          <div className="flex flex-col h-full min-h-0">
            <UserSearchSection
              selectedUser={selectedUser}
              onSelectUser={setSelectedUser}
            />
          </div>
        );

      case 1: // Staff Configuration
        if (!selectedUser) {
          return (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Please go back and select a user first</p>
            </div>
          );
        }

        return (
          <div className="flex flex-col space-y-4">
            <SelectedUserSummary user={selectedUser} />

            <WorkScheduleSection
              workSchedule={workSchedule}
              onDayToggle={handleDayToggle}
              onDayTimeChange={handleDayTimeChange}
            />

            <PermissionsSection
              permissions={permissions}
              onPermissionChange={handlePermissionChange}
            />
          </div>
        );

      case 2: // Summary
        if (!selectedUser) return null;

        const enabledDays = Object.entries(workSchedule).filter(([_, day]) => day.enabled);

        return (
          <div className="space-y-6">
            {/* User Summary */}
            <div className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[var(--accent-text)]" />
                <h3 className="text-lg font-semibold text-foreground">Selected User</h3>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage
                    src={formatAvatarUrl(selectedUser.avatar, selectedUser.firstName, selectedUser.lastName)}
                    alt={selectedUser.name}
                  />
                  <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-lg">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                  <p className="text-xs text-muted-foreground mt-1">Role: {selectedUser.role}</p>
                </div>
              </div>
            </div>

            {/* Work Schedule Summary */}
            <div className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-[var(--accent-text)]" />
                <h3 className="text-lg font-semibold text-foreground">Work Schedule</h3>
              </div>
              <div className="space-y-2">
                {enabledDays.length > 0 ? (
                  enabledDays.map(([dayId, day]) => {
                    const dayName = dayId.charAt(0).toUpperCase() + dayId.slice(1);
                    return (
                      <div key={dayId} className="flex items-center justify-between p-2 rounded bg-[var(--accent-bg)] border border-[var(--accent-border)]">
                        <span className="text-sm font-medium text-foreground">{dayName}</span>
                        <span className="text-sm text-muted-foreground">{day.startTime} - {day.endTime}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No work days enabled</p>
                )}
              </div>
            </div>

            {/* Permissions Summary */}
            <div className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-[var(--accent-text)]" />
                <h3 className="text-lg font-semibold text-foreground">Permissions</h3>
              </div>
              <div className="space-y-2">
                {permissions.length > 0 ? (
                  permissions.map((permission) => (
                    <div key={permission} className="p-2 rounded bg-[var(--accent-bg)] border border-[var(--accent-border)]">
                      <span className="text-sm text-foreground">{permission}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No permissions assigned</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editingStaff ? "Edit Staff Member" : "Add Staff Member"}
      description={editingStaff ? "Update staff member details and permissions" : "Complete the wizard to add a new staff member"}
      maxWidth="max-w-[95vw]"
      className="w-[98vw] sm:w-[95vw] md:w-[1800px] lg:w-[2000px] xl:w-[95vw] h-[90vh] sm:h-[85vh] md:h-[800px] lg:h-[850px] min-h-[700px] max-h-[90vh] sm:max-h-[85vh] md:max-h-[800px] lg:max-h-[850px]"
      disableContentScroll={true}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)]"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}

            <Button
              variant="accent"
              onClick={handleNext}
              disabled={!canProceed}
              className="min-w-32"
            >
              {isLastStep ? (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {editingStaff ? "Update Staff" : "Add Staff"}
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="h-full overflow-hidden flex flex-col">
        <StepIndicator />

        <div className="flex-1 min-h-0 overflow-hidden">
          {/* All steps use the same structure - no Card wrapper */}
          <div className="h-full flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-6 border-b border-[var(--glass-border)] pb-4 flex-shrink-0">
              {(() => {
                const StepIcon = steps[currentStep].icon;
                return <StepIcon className="w-5 h-5 text-[var(--accent-text)]" />;
              })()}
              <h3 className="text-lg font-semibold text-foreground">{steps[currentStep].title}</h3>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>
    </CustomDialog>
  );
};
