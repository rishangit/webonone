const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5007/api';

export interface AppointmentHistoryItem {
  id: string;
  appointmentId?: string | null; // Optional - direct sales don't have appointmentId
  userId: string;
  companyId: string;
  serviceId?: string;
  staffId?: string;
  spaceId?: string;
  servicesUsed?: Array<{
    serviceId: string; // Reference ID
    quantity: number;
    unitPrice: number; // Price at time of sale
    discount: number;
    // Enriched fields (when enrich=true)
    name?: string;
    description?: string;
  }>;
  productsUsed?: Array<{
    productId: string; // Reference ID
    variantId?: string | null; // Reference ID
    quantity: number;
    unitPrice: number; // Price at time of sale
    discount: number;
    // Enriched fields (when enrich=true)
    name?: string;
    description?: string;
    unit?: string;
  }>;
  totalAmount: number;
  subtotal: number;
  discountAmount: number;
  createdAt?: string;
  updatedAt?: string;
  // Joined data
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userAvatar?: string;
  userFirstName?: string;
  userLastName?: string;
  companyName?: string;
}

class AppointmentHistoryService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getAppointmentHistory(filters?: {
    page?: number;
    limit?: number;
    userId?: string;
    companyId?: string;
    serviceId?: string;
    staffId?: string;
    dateFrom?: string;
    dateTo?: string;
    enrich?: boolean; // Option to enrich with product/service details
  }): Promise<AppointmentHistoryItem[]> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.serviceId) params.append('serviceId', filters.serviceId);
    if (filters?.staffId) params.append('staffId', filters.staffId);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.enrich) params.append('enrich', 'true');

    const response = await fetch(`${API_BASE_URL}/appointment-history?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch appointment history');
    }

    const data = await response.json();
    return data.data || [];
  }

  async getAppointmentHistoryById(id: string): Promise<AppointmentHistoryItem> {
    const response = await fetch(`${API_BASE_URL}/appointment-history/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch appointment history');
    }

    const data = await response.json();
    return data.data;
  }

  async getAppointmentHistoryByUserId(userId: string, filters?: {
    page?: number;
    limit?: number;
    companyId?: string;
    dateFrom?: string;
    dateTo?: string;
    enrich?: boolean;
  }): Promise<AppointmentHistoryItem[]> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.enrich) params.append('enrich', 'true');

    const response = await fetch(`${API_BASE_URL}/appointment-history/user/${userId}?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user appointment history');
    }

    const data = await response.json();
    return data.data || [];
  }

  async getUsersWithAppointments(companyId: string): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
    appointmentCount: number;
    lastAppointmentDate: string;
  }>> {
    const response = await fetch(`${API_BASE_URL}/appointment-history/company/${companyId}/users`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users with appointments');
    }

    const data = await response.json();
    return data.data || [];
  }

  async getAppointmentHistoryByAppointmentId(appointmentId: string, enrich: boolean = true): Promise<AppointmentHistoryItem | null> {
    const params = new URLSearchParams();
    if (enrich) params.append('enrich', 'true');
    const response = await fetch(`${API_BASE_URL}/appointment-history/appointment/${appointmentId}?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No history found for this appointment
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch appointment history');
    }

    const data = await response.json();
    return data.data || null;
  }
}

export const appointmentHistoryService = new AppointmentHistoryService();

