/**
 * Appointment Status Enum
 * Status values are stored as numbers in the database
 */
const AppointmentStatus = {
  PENDING: 0,
  CONFIRMED: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
  CANCELLED: 4,
  NO_SHOW: 5
};

// Status labels for display
const AppointmentStatusLabels = {
  [AppointmentStatus.PENDING]: 'Pending',
  [AppointmentStatus.CONFIRMED]: 'Confirmed',
  [AppointmentStatus.IN_PROGRESS]: 'In Progress',
  [AppointmentStatus.COMPLETED]: 'Completed',
  [AppointmentStatus.CANCELLED]: 'Cancelled',
  [AppointmentStatus.NO_SHOW]: 'No Show'
};

// Array of all valid statuses for validation
const AppointmentStatusValues = Object.values(AppointmentStatus);

// Helper function to check if a status is valid
const isValidAppointmentStatus = (status) => {
  const numStatus = typeof status === 'string' ? parseInt(status, 10) : status;
  return !isNaN(numStatus) && AppointmentStatusValues.includes(numStatus);
};

// Helper function to get status label
const getAppointmentStatusLabel = (status) => {
  return AppointmentStatusLabels[status] || 'Unknown';
};

// Helper function to normalize status (accepts string or number)
const normalizeAppointmentStatus = (status) => {
  if (status === null || status === undefined) return null;
  
  // If it's already a number, validate it
  if (typeof status === 'number') {
    return isValidAppointmentStatus(status) ? status : null;
  }
  
  // If it's a string, try to parse it or map it
  const statusMap = {
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
  return isValidAppointmentStatus(numStatus) ? numStatus : null;
};

module.exports = {
  AppointmentStatus,
  AppointmentStatusLabels,
  AppointmentStatusValues,
  isValidAppointmentStatus,
  getAppointmentStatusLabel,
  normalizeAppointmentStatus
};

