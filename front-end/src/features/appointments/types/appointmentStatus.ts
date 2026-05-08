/**
 * Appointment Status Enum
 * Status values are stored as numbers in the database
 */
export enum AppointmentStatus {
  PENDING = 0,
  CONFIRMED = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
  CANCELLED = 4,
  NO_SHOW = 5
}

// Status labels for display
export const AppointmentStatusLabels: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'Pending',
  [AppointmentStatus.CONFIRMED]: 'Confirmed',
  [AppointmentStatus.IN_PROGRESS]: 'In Progress',
  [AppointmentStatus.COMPLETED]: 'Completed',
  [AppointmentStatus.CANCELLED]: 'Cancelled',
  [AppointmentStatus.NO_SHOW]: 'No Show'
};

// Array of all valid statuses for validation
export const AppointmentStatusValues = Object.values(AppointmentStatus).filter(
  (v): v is AppointmentStatus => typeof v === 'number'
) as AppointmentStatus[];

// Type for appointment status
export type AppointmentStatusType = AppointmentStatus;

// Helper function to check if a status is valid
export const isValidAppointmentStatus = (status: number | string): status is AppointmentStatus => {
  const numStatus = typeof status === 'string' ? parseInt(status, 10) : status;
  return !isNaN(numStatus) && AppointmentStatusValues.includes(numStatus as AppointmentStatus);
};

// Helper function to get status label
export const getAppointmentStatusLabel = (status: AppointmentStatus): string => {
  return AppointmentStatusLabels[status] || 'Unknown';
};

// Helper function to normalize status (accepts string or number)
export const normalizeAppointmentStatus = (status: string | number | undefined | null): AppointmentStatus | null => {
  if (status === null || status === undefined) return null;
  
  // If it's already a number, validate it
  if (typeof status === 'number') {
    return isValidAppointmentStatus(status) ? status as AppointmentStatus : null;
  }
  
  // If it's a string, try to parse it or map it
  const statusMap: Record<string, AppointmentStatus> = {
    'pending': AppointmentStatus.PENDING,
    '0': AppointmentStatus.PENDING,
    'confirmed': AppointmentStatus.CONFIRMED,
    '1': AppointmentStatus.CONFIRMED,
    'in progress': AppointmentStatus.IN_PROGRESS,
    'in-progress': AppointmentStatus.IN_PROGRESS,
    'in_progress': AppointmentStatus.IN_PROGRESS,
    'inprogress': AppointmentStatus.IN_PROGRESS,
    '2': AppointmentStatus.IN_PROGRESS,
    'completed': AppointmentStatus.COMPLETED,
    '3': AppointmentStatus.COMPLETED,
    'cancelled': AppointmentStatus.CANCELLED,
    'canceled': AppointmentStatus.CANCELLED,
    '4': AppointmentStatus.CANCELLED,
    'no show': AppointmentStatus.NO_SHOW,
    'no-show': AppointmentStatus.NO_SHOW,
    'no_show': AppointmentStatus.NO_SHOW,
    'noshow': AppointmentStatus.NO_SHOW,
    '5': AppointmentStatus.NO_SHOW
  };
  
  const normalized = statusMap[status.toLowerCase()];
  if (normalized !== undefined) return normalized;
  
  // Try parsing as number
  const numStatus = parseInt(status, 10);
  return isValidAppointmentStatus(numStatus) ? numStatus as AppointmentStatus : null;
};

