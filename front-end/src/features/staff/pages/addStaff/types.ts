// Types for AddStaffDialog components

export interface UserForSelection {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  location?: string;
  address?: string;
  joinDate?: string;
  createdAt?: string;
  appointmentsCount?: number;
}

export interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStaff: (staffData: {
    userId: string;
    role?: string;
    permissions: string[];
    workSchedule: {
      schedule?: Record<string, { startTime: string; endTime: string; enabled: boolean }>;
      startTime?: string;
      endTime?: string;
      availableDays?: string[];
    };
  }) => void;
  editingStaff?: {
    id: string;
    userId?: string;
    role?: string;
    department?: string;
    permissions?: string[] | Record<string, any>;
    workSchedule?: {
      schedule?: Record<string, { startTime: string; endTime: string; enabled: boolean }>;
      startTime?: string;
      endTime?: string;
      availableDays?: string[];
    };
  } | null;
  onEditStaff?: (staffData: {
    id: string;
    userId?: string;
    role?: string;
    permissions: string[];
    workSchedule: {
      schedule?: Record<string, { startTime: string; endTime: string; enabled: boolean }>;
      startTime?: string;
      endTime?: string;
      availableDays?: string[];
    };
  }) => void;
  companyId?: string;
}
