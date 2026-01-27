import { apiService } from './api';

export interface SaleItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  unit?: string;
  variantId?: string;
  variantName?: string;
}

export interface CreateSaleData {
  appointmentId?: string | null;
  companyId: string;
  serviceId?: string | null;
  clientId: string;
  amount: number;
  paymentMethod?: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Refunded';
  saleDate?: string;
  items: SaleItem[];
  notes?: string | null;
}

export interface Sale {
  id: string;
  appointmentId?: string | null;
  companyId: string;
  serviceId?: string | null;
  clientId: string;
  amount: number;
  paymentMethod?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  saleDate: string;
  items: SaleItem[];
  notes?: string | null;
  createdAt: string;
}

class SalesService {
  async createSale(saleData: CreateSaleData): Promise<Sale> {
    const response = await apiService.post<{ success: boolean; data: Sale; message: string }>('/sales', saleData);
    return response.data;
  }

  async getSales(limit?: number, offset?: number): Promise<Sale[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/sales?${queryString}` : '/sales';
    const response = await apiService.get<{ success: boolean; data: Sale[] }>(endpoint);
    return response.data;
  }

  async getSaleById(id: string): Promise<Sale> {
    const response = await apiService.get<{ success: boolean; data: Sale }>(`/sales/${id}`);
    return response.data;
  }
}

export const salesService = new SalesService();

