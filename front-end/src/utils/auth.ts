// Authentication utilities
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const getUser = (): any | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setAuthData = (user: any, token: string): void => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const hasRole = (requiredRole: string): boolean => {
  const user = getUser();
  return user?.role === requiredRole;
};

// Permissions removed - now using role-based access control
// Use hasRole instead for access control
export const hasPermission = (permission: string): boolean => {
  // For backward compatibility, map permissions to roles
  const user = getUser();
  if (!user) return false;
  
  // Super Admin has all permissions
  if (user.role === 'Super Admin' || user.roleLevel === 0) return true;
  
  // Map permissions to role levels
  const permissionToRole: Record<string, number> = {
    'manage_system': 0,
    'manage_company': 1,
    'manage_staff': 1,
    'view_analytics': 1,
    'manage_appointments': 2,
    'process_payments': 2,
    'manage_services': 1,
    'view_reports': 1,
    'view_client_info': 2,
    'update_appointments': 2,
    'view_schedule': 2,
    'book_appointments': 3,
    'view_history': 3,
    'manage_profile': 3,
    'view_services': 3
  };
  
  const requiredRole = permissionToRole[permission] ?? 3;
  return (user.roleLevel ?? 3) <= requiredRole;
};





