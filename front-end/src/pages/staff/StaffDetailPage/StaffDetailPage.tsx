import { BackButton } from "../../../components/common/BackButton";
import { useStaffDetailPage } from "./hooks/useStaffDetailPage";
import {
  StaffDetailHeader,
  PersonalInfoCard,
  PermissionsCard,
  WorkScheduleCard,
} from "./components";
import { StaffDetailPageProps } from "./types";

export const StaffDetailPage = ({ staffId, onBack, currentUser }: StaffDetailPageProps) => {
  const {
    currentStaff,
    loading,
    isEditing,
    setIsEditing,
    userInfo,
    permissions,
    workSchedule,
    handleSave,
    handleCancel,
    handlePermissionChange,
    handleDayToggle,
    handleDayTimeChange,
  } = useStaffDetailPage({ staffId, onBack, currentUser });

  if (loading) {
    return (
      <div className="flex-1 p-4 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
        </div>
      </div>
    );
  }

  if (!currentStaff) {
    return (
      <div className="flex-1 p-4 lg:p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Staff member not found</p>
          <BackButton onClick={onBack} label="Back to Staff" className="mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <BackButton onClick={onBack} />
        
        <StaffDetailHeader
          staff={currentStaff}
          userInfo={userInfo}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onCancel={handleCancel}
          onSave={handleSave}
        />

        {/* Three Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PersonalInfoCard staff={currentStaff} userInfo={userInfo} />
          
          <PermissionsCard
            permissions={permissions}
            isEditing={isEditing}
            onPermissionChange={handlePermissionChange}
          />
          
          <WorkScheduleCard
            staff={currentStaff}
            workSchedule={workSchedule}
            isEditing={isEditing}
            onDayToggle={handleDayToggle}
            onDayTimeChange={handleDayTimeChange}
          />
        </div>
      </div>
    </div>
  );
};
