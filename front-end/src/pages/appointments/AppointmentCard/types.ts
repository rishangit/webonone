import { AppointmentStatus } from "@/types/appointmentStatus";

export interface AppointmentCardProps {
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
  selectedEntities?: string[] | null; // Company's selected entities
}

export interface AppointmentViewProps {
  date: string;
  time: string;
  duration: string;
  phone: string;
  location: string;
  hasSpaceEntity: boolean;
  hasStaffEntity: boolean;
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
  availableStaff: Array<{ id: string; name: string; image?: string; specialization: string; isAssigned?: boolean }>;
  currentStaffId: string;
  handleStaffAssignment: (selectedStaff: { id: string; name: string; image?: string; specialization: string }) => void;
}
