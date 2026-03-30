import { config } from "@/config/environment";

const API_BASE_URL = config.apiBaseUrl;

export interface CompanyWebHeaderContent {
  contentContainer?: {
    minHeightPx?: number;
    backgroundColor?: string;
  };
  blocks?: Array<Record<string, unknown>>;
  html?: string;
  css?: string;
  js?: string;
}

export interface CompanyWebHeader {
  id: string;
  companyId: string;
  name: string;
  isDefault?: boolean;
  content?: CompanyWebHeaderContent | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWebHeaderData {
  companyId: string;
  name: string;
  isDefault?: boolean;
  content?: CompanyWebHeaderContent | null;
}

export interface UpdateWebHeaderData {
  name?: string;
  isDefault?: boolean;
  content?: CompanyWebHeaderContent | null;
}

class CompanyWebHeadersService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getHeaders(companyId: string): Promise<CompanyWebHeader[]> {
    const response = await fetch(`${API_BASE_URL}/company-web-headers?companyId=${companyId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data || [];
  }

  async getHeaderById(id: string): Promise<CompanyWebHeader> {
    const response = await fetch(`${API_BASE_URL}/company-web-headers/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  }

  /** Public — default header for published site layout */
  async getDefaultHeaderPublic(companyId: string): Promise<CompanyWebHeader | null> {
    const response = await fetch(`${API_BASE_URL}/company-web-headers/public/${companyId}/default`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data ?? null;
  }

  async createHeader(payload: CreateWebHeaderData): Promise<CompanyWebHeader> {
    const response = await fetch(`${API_BASE_URL}/company-web-headers`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  }

  async updateHeader(id: string, payload: UpdateWebHeaderData): Promise<CompanyWebHeader> {
    const response = await fetch(`${API_BASE_URL}/company-web-headers/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  }

  async deleteHeader(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/company-web-headers/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const companyWebHeadersService = new CompanyWebHeadersService();
