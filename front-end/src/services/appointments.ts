import { AppointmentStatusType } from '../types/appointmentStatus';

import { PaginationMeta } from './products';
import { config } from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

export interface Appointment {
  id: string;
  clientId: string;
  // Removed duplicate data fields - use clientId to fetch from users table
  // clientName, clientEmail, clientPhone
  companyId: string;
  // Removed duplicate data field - use companyId to fetch from companies table
  // companyName
  serviceId?: string;
  // Removed duplicate data field - use serviceId to fetch from services table
  // serviceName
  staffId?: string;
  // Use staffId to fetch staff data from company_staff table
  spaceId?: string;
  // Removed duplicate data field - use spaceId to fetch from spaces table
  // spaceName
  date: string;
  time: string;
  duration?: number;
  status: AppointmentStatusType;
  type?: string;
  priority?: string;
  price?: number;
  paymentStatus?: "Pending" | "Paid" | "Partially Paid" | "Refunded";
  paymentMethod?: string;
  notes?: string;
  reminderSent?: boolean;
  preferredStaffIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAppointmentData {
  clientId: string;
  // Removed duplicate data fields - use clientId reference only
  // clientName, clientEmail, clientPhone
  companyId: string;
  // Removed duplicate data field - use companyId reference only
  // companyName
  serviceId?: string;
  // Removed duplicate data field - use serviceId reference only
  // serviceName
  staffId?: string;
  // Use staffId reference to fetch staff data from company_staff table
  spaceId?: string;
  // Removed duplicate data field - use spaceId reference only
  // spaceName
  date: string;
  time: string;
  duration?: number;
  status?: "Pending" | "Confirmed" | "In Progress" | "Completed" | "Cancelled" | "No Show";
  type?: string;
  priority?: string;
  price?: number;
  paymentStatus?: "Pending" | "Paid" | "Partially Paid" | "Refunded";
  paymentMethod?: string;
  notes?: string;
  preferredStaffIds?: string[];
}

export interface UpdateAppointmentData {
  clientId?: string;
  // Removed duplicate data fields - use clientId reference only
  // clientName, clientEmail, clientPhone
  companyId?: string;
  // Removed duplicate data field - use companyId reference only
  // companyName
  serviceId?: string;
  // Removed duplicate data field - use serviceId reference only
  // serviceName
  staffId?: string;
  // Use staffId reference to fetch staff data from company_staff table
  spaceId?: string;
  // Removed duplicate data field - use spaceId reference only
  // spaceName
  date?: string;
  time?: string;
  duration?: number;
  status?: "Pending" | "Confirmed" | "In Progress" | "Completed" | "Cancelled" | "No Show";
  type?: string;
  priority?: string;
  price?: number;
  paymentStatus?: "Pending" | "Paid" | "Partially Paid" | "Refunded";
  paymentMethod?: string;
  notes?: string;
  preferredStaffIds?: string[];
}

class AppointmentsService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getAppointments(companyId?: string, filters?: {
    page?: number;
    limit?: number;
    offset?: number;
    status?: string;
    date?: string;
    dateFrom?: string;
    dateTo?: string;
    clientId?: string;
    staffId?: string;
    search?: string;
  }): Promise<{ appointments: Appointment[]; pagination: PaginationMeta }> {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset !== undefined) params.append('offset', filters.offset.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.staffId) params.append('staffId', filters.staffId);
    if (filters?.search) params.append('search', filters.search);

    const url = `${API_BASE_URL}/appointments?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch appointments');
    }

    const data = await response.json();
    return {
      appointments: data.data || [],
      pagination: data.pagination || {
        total: 0,
        limit: filters?.limit || 10,
        offset: filters?.offset || 0,
        totalPages: 1,
        currentPage: filters?.page || 1
      }
    };
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch appointment');
    }

    const data = await response.json();
    return data.data;
  }

  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create appointment');
    }

    const result = await response.json();
    return result.data;
  }

  async updateAppointment(id: string, data: UpdateAppointmentData): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update appointment');
    }

    const result = await response.json();
    return result.data;
  }

  async deleteAppointment(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete appointment');
    }
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatusType, completionData?: {
    status: string;
    notes: string;
    billingItems: Array<{
      id: string;
      type: "product" | "service";
      name: string;
      description: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      unit?: string;
    }>;
    totalAmount: number;
  }): Promise<Appointment> {
    const body: any = { status };
    if (completionData) {
      body.completionData = completionData;
    }

    const response = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update appointment status');
    }

    const result = await response.json();
    return result.data;
  }

  async getAppointmentsByDateRange(startDate: string, endDate: string, companyId?: string): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);

    const response = await fetch(`${API_BASE_URL}/appointments/range/${startDate}/${endDate}?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch appointments by date range');
    }

    const data = await response.json();
    return data.data || [];
  }

  async getAppointmentsByUserId(userId: string, filters?: { status?: string; limit?: number }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/appointments/user/${userId}?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user appointments');
    }

    const data = await response.json();
    return data.data || [];
  }
}

export const appointmentsService = new AppointmentsService();

