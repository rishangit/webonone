import { PaginationMeta } from './products';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5007/api';

export interface Staff {
  id: string;
  companyId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  department?: string;
  avatar?: string;
  status: "Active" | "Inactive" | "Pending";
  bio?: string;
  address?: string;
  skills?: string[];
  permissions?: Record<string, any>;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  workSchedule?: Record<string, any>;
  joinDate?: string;
  lastActive?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStaffData {
  companyId: string;
  userId: string; // userId is now required
  role?: string;
  department?: string;
  status?: "Active" | "Inactive" | "Pending";
  bio?: string;
  skills?: string[];
  permissions?: Record<string, any>;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  workSchedule?: Record<string, any>;
  joinDate?: string;
  lastActive?: string;
}

export interface UpdateStaffData {
  userId?: string; // Allow changing user reference
  role?: string;
  department?: string;
  status?: "Active" | "Inactive" | "Pending";
  bio?: string;
  skills?: string[];
  permissions?: Record<string, any>;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  workSchedule?: Record<string, any>;
  lastActive?: string;
}

class StaffService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Get all staff for a company (with pagination, search, filters)
   */
  async getStaff(filters?: {
    companyId?: string;
    limit?: number;
    offset?: number;
    page?: number;
    search?: string;
    status?: string;
    role?: string;
    department?: string;
  }): Promise<{ staff: Staff[]; pagination: PaginationMeta }> {
    const params = new URLSearchParams();
    
    if (filters?.companyId) {
      params.append('companyId', filters.companyId);
    }
    if (filters?.limit) {
      params.append('limit', String(filters.limit));
    }
    if (filters?.offset !== undefined) {
      params.append('offset', String(filters.offset));
    }
    if (filters?.page) {
      params.append('page', String(filters.page));
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.role) {
      params.append('role', filters.role);
    }
    if (filters?.department) {
      params.append('department', filters.department);
    }

    const response = await fetch(`${API_BASE_URL}/staff?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      staff: data.data || [],
      pagination: data.pagination || {
        total: 0,
        limit: filters?.limit || 12,
        offset: filters?.offset || 0,
        totalPages: 0,
        currentPage: filters?.page || 1,
      },
    };
  }

  /**
   * Get staff by ID
   */
  async getStaffById(staffId: string): Promise<Staff> {
    const response = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Create new staff
   */
  async createStaff(companyId: string, staffData: CreateStaffData): Promise<Staff> {
    const response = await fetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        ...staffData,
        companyId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Update staff
   */
  async updateStaff(staffId: string, staffData: UpdateStaffData): Promise<Staff> {
    const response = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(staffData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Delete staff
   */
  async deleteStaff(staffId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const staffService = new StaffService();
export type { CreateStaffData, UpdateStaffData };

