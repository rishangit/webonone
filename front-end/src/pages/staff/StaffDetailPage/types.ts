import { Staff } from "@/services/staff";

export interface StaffDetailPageProps {
  staffId: string;
  onBack: () => void;
  currentUser?: {
    email: string;
    role: string;
    name: string;
    companyId?: string;
  } | null;
}

export interface StaffDetailHeaderProps {
  staff: Staff;
  userInfo?: any;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export interface PersonalInfoCardProps {
  staff: Staff;
  userInfo?: any;
}

export interface PermissionsCardProps {
  permissions: string[];
  isEditing: boolean;
  onPermissionChange: (permission: string, checked: boolean) => void;
}

export interface WorkScheduleCardProps {
  staff: Staff;
  workSchedule: Record<string, { startTime: string; endTime: string; enabled: boolean }>;
  isEditing: boolean;
  onDayToggle: (dayId: string) => void;
  onDayTimeChange: (dayId: string, field: 'startTime' | 'endTime', value: string) => void;
}

export interface DayScheduleItemProps {
  day: { id: string; label: string; fullName: string };
  daySchedule: { startTime: string; endTime: string; enabled: boolean };
  isEditing: boolean;
  onToggle: () => void;
  onTimeChange: (field: 'startTime' | 'endTime', value: string) => void;
  timeOptions: string[];
}
