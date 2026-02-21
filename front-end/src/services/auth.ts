import { SignUpFormData, AuthResponse, User, UserRole } from '../types/user';
import { apiEndpoints } from '../config/environment';

// Auth service for handling authentication
class AuthService {
  // Register new user
  static async register(userData: SignUpFormData): Promise<AuthResponse> {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 5000);
      
      const response = await fetch(apiEndpoints.auth.register, {
        signal: controller.signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password,
          role: userData.role ?? UserRole.USER, // Default role for sign-ups (User = 3)
        }),
      });

      // Clear timeout on successful response
      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<AuthResponse | { requiresRoleSelection: true; user: User; roles: any[] }> {
    try {
      const response = await fetch(apiEndpoints.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Check if role selection is required
      if (data.data.requiresRoleSelection) {
        return {
          requiresRoleSelection: true,
          user: data.data.user,
          roles: data.data.roles
        };
      }

      return data.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Complete login with selected role
  // roleId can be null if USER role is selected (since USER is not stored in users_role table)
  static async completeLoginWithRole(email: string, roleId: string | null): Promise<AuthResponse> {
    try {
      // Replace /login with /login/complete in the endpoint
      const completeLoginUrl = apiEndpoints.auth.login.replace('/login', '/login/complete');
      const response = await fetch(completeLoginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, roleId: roleId || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data.data;
    } catch (error) {
      console.error('Complete login error:', error);
      throw error;
    }
  }

  // Get current user profile
  static async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await fetch(apiEndpoints.auth.me, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Handle network errors (server not running, etc.)
      if (!response.ok && response.status === 0) {
        throw new Error('Cannot connect to server. Please ensure the backend server is running.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user profile');
      }

      return data.data;
    } catch (error) {
      // Only log non-network errors to avoid console spam
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        // Server is not running - this is expected if backend is down
        throw new Error('Backend server is not running. Please start the server.');
      }
      console.error('Get user error:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(token: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await fetch(apiEndpoints.auth.me, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      return data.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Logout user
  static async logout(token: string): Promise<void> {
    try {
      await fetch(apiEndpoints.auth.logout, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error for logout as it's not critical
    }
  }

  // Refresh token
  static async refreshToken(token: string): Promise<{ token: string }> {
    try {
      const response = await fetch(apiEndpoints.auth.refresh, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      return data.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  // Verify token
  static async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(apiEndpoints.auth.verify, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  // Impersonate user (Super Admin only)
  static async impersonateUser(token: string, userId: string): Promise<AuthResponse & { originalAdmin: any } | { requiresRoleSelection: true; user: User; roles: any[]; originalAdmin: any }> {
    try {
      const response = await fetch(apiEndpoints.auth.impersonate(userId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Impersonation failed');
      }

      // Check if role selection is required
      if (data.data.requiresRoleSelection) {
        return {
          requiresRoleSelection: true,
          user: data.data.user,
          roles: data.data.roles,
          originalAdmin: data.data.originalAdmin
        };
      }

      return data.data;
    } catch (error) {
      console.error('Impersonate user error:', error);
      throw error;
    }
  }

  // Complete impersonation with selected role
  static async completeImpersonateWithRole(token: string, userId: string, roleId: string | null): Promise<AuthResponse & { originalAdmin: any }> {
    try {
      const response = await fetch(apiEndpoints.auth.impersonateComplete(userId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleId: roleId || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Impersonation failed');
      }

      return data.data;
    } catch (error) {
      console.error('Complete impersonation error:', error);
      throw error;
    }
  }

  // Request password reset
  static async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(apiEndpoints.auth.forgotPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset email');
      }

      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(apiEndpoints.auth.resetPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Verify reset token
  static async verifyResetToken(token: string): Promise<{ success: boolean; valid: boolean; message?: string }> {
    try {
      const response = await fetch(`${apiEndpoints.auth.verifyResetToken}?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Verify reset token error:', error);
      return { success: false, valid: false, message: 'Failed to verify token' };
    }
  }
}

// Export the auth service object with static methods
export const authService = {
  register: AuthService.register,
  login: AuthService.login,
  completeLoginWithRole: AuthService.completeLoginWithRole,
  getCurrentUser: AuthService.getCurrentUser,
  updateProfile: AuthService.updateProfile,
  logout: AuthService.logout,
  refreshToken: AuthService.refreshToken,
  verifyToken: AuthService.verifyToken,
  forgotPassword: AuthService.forgotPassword,
  resetPassword: AuthService.resetPassword,
  verifyResetToken: AuthService.verifyResetToken,
  impersonateUser: AuthService.impersonateUser,
  completeImpersonateWithRole: AuthService.completeImpersonateWithRole,
};