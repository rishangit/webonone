import { config } from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

export interface CompanySale {
  id: string;
  appointmentId?: string | null;
  userId: string;
  companyId: string;
  serviceId?: string;
  staffId?: string;
  spaceId?: string;
  servicesUsed?: Array<{
    serviceId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    name?: string;
    description?: string;
  }>;
  productsUsed?: Array<{
    productId?: string; // Optional - not stored, get from variant when needed
    variantId: string; // Required - product items now only store variantId
    quantity: number;
    unitPrice: number;
    discount: number;
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

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  totalPages: number;
  currentPage: number;
}

class CompanySalesService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getCompanySales(filters?: {
    page?: number;
    limit?: number;
    offset?: number;
    search?: string;
    userId?: string;
    companyId?: string;
    serviceId?: string;
    staffId?: string;
    dateFrom?: string;
    dateTo?: string;
    enrich?: boolean;
  }): Promise<CompanySale[] | { sales: CompanySale[]; pagination: PaginationMeta }> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset !== undefined) params.append('offset', filters.offset.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.serviceId) params.append('serviceId', filters.serviceId);
    if (filters?.staffId) params.append('staffId', filters.staffId);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.enrich) params.append('enrich', 'true');

    const response = await fetch(`${API_BASE_URL}/company-sales?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch company sales');
    }

    const data = await response.json();
    
    // If pagination metadata exists, return both sales and pagination
    if (data.pagination) {
      return {
        sales: data.data || [],
        pagination: data.pagination
      };
    }
    
    // Otherwise, return just the sales array for backward compatibility
    return data.data || [];
  }

  async getCompanySaleById(id: string, enrich: boolean = true): Promise<CompanySale> {
    const params = new URLSearchParams();
    if (enrich) params.append('enrich', 'true');
    
    const response = await fetch(`${API_BASE_URL}/company-sales/${id}?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch company sale');
    }

    const data = await response.json();
    return data.data;
  }

  async deleteSale(saleId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/company-sales/${saleId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete sale');
    }
  }

  async deleteSaleItem(saleId: string, itemId: string): Promise<CompanySale> {
    const response = await fetch(`${API_BASE_URL}/company-sales/${saleId}/items/${itemId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete sale item');
    }

    const data = await response.json();
    return data.data;
  }
}

export const companySalesService = new CompanySalesService();

