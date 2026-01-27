// User role types and enums for backend
const UserRole = {
  SYSTEM_ADMIN: 0,
  COMPANY_OWNER: 1,
  STAFF_MEMBER: 2,
  USER: 3
};

// Role names for display
const UserRoleNames = {
  [UserRole.SYSTEM_ADMIN]: 'System Admin',
  [UserRole.COMPANY_OWNER]: 'Company Owner',
  [UserRole.STAFF_MEMBER]: 'Staff Member',
  [UserRole.USER]: 'User'
};

// User permissions by role
const UserPermissions = {
  [UserRole.SYSTEM_ADMIN]: ['*'], // All permissions
  [UserRole.COMPANY_OWNER]: [
    'manage_company',
    'manage_staff', 
    'view_analytics',
    'manage_appointments',
    'manage_services',
    'view_reports'
  ],
  [UserRole.STAFF_MEMBER]: [
    'manage_appointments',
    'view_client_info',
    'process_payments',
    'update_appointments',
    'view_schedule'
  ],
  [UserRole.USER]: [
    'book_appointments',
    'view_history',
    'manage_profile',
    'view_services'
  ]
};

// Default user data for new registrations
const getDefaultUserData = (role = UserRole.USER) => {
  return {
    role,
    isActive: true,
    isVerified: false,
    // permissions removed - now using role-based access control
    preferences: {
      theme: 'system',
      notifications: true,
      language: 'en'
    },
    // appointmentsCount, totalSpent, joinDate, emergencyContact removed
  };
};

module.exports = {
  UserRole,
  UserRoleNames,
  UserPermissions,
  getDefaultUserData
};

