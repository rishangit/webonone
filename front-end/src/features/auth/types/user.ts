// User role types and enums
export enum UserRole {
  SYSTEM_ADMIN = 0,
  COMPANY_OWNER = 1,
  STAFF_MEMBER = 2,
  USER = 3,
}

// Role names for display
export const UserRoleNames = {
  [UserRole.SYSTEM_ADMIN]: "System Admin",
  [UserRole.COMPANY_OWNER]: "Company Owner",
  [UserRole.STAFF_MEMBER]: "Staff Member",
  [UserRole.USER]: "User",
} as const;

const normalizeRole = (role: string | number | UserRole): UserRole | null => {
  if (typeof role === "number") {
    return role as UserRole;
  }

  const roleStr = String(role).trim().toLowerCase();
  const normalizedRole = roleStr.replace(/[_-]+/g, " ");
  if (
    normalizedRole === "super admin" ||
    normalizedRole === "system admin" ||
    roleStr === "super_admin" ||
    roleStr === "system_admin" ||
    roleStr === "0"
  ) {
    return UserRole.SYSTEM_ADMIN;
  }
  if (normalizedRole === "company owner" || roleStr === "company_owner" || roleStr === "1") {
    return UserRole.COMPANY_OWNER;
  }
  if (normalizedRole === "staff member" || normalizedRole === "staff" || roleStr === "staff_member" || roleStr === "2") {
    return UserRole.STAFF_MEMBER;
  }
  if (normalizedRole === "user" || roleStr === "3") {
    return UserRole.USER;
  }

  return null;
};

// Helper function to check if role matches enum
export const isRole = (role: string | number | UserRole | undefined, targetRole: UserRole): boolean => {
  if (role === undefined) return false;
  const normalizedRole = normalizeRole(role);
  return normalizedRole === targetRole;
};

// User role from users_role table
export interface UserRoleData {
  id: string | null;
  role: UserRole;
  companyId?: string | null;
  isDefault?: boolean;
}

// User interface with role information
export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: UserRole; // Deprecated - use roles array instead
  roles?: UserRoleData[]; // All roles from users_role table
  avatar?: string;
  companyId?: string | null;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  preferences?: {
    theme?: string;
    notifications?: boolean;
    language?: string;
  };
  permissions?: string[];
  isActive: boolean;
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  companies?: any[]; // Companies owned by this user (from profile endpoint)
}

// Sign up form data interface
export interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  role?: UserRole;
}

// API response interface
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Authentication response interface
export interface AuthResponse {
  user: User;
  token: string;
}
