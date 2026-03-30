import { config } from "@/config/environment";

const API_BASE_URL = config.apiBaseUrl;

export interface CompanyWebFooterContent {
  contentContainer?: {
    minHeightPx?: number;
    backgroundColor?: string;
  };
  blocks?: Array<Record<string, unknown>>;
  html?: string;
  css?: string;
  js?: string;
}

export interface CompanyWebFooter {
  id: string;
  companyId: string;
  name: string;
  isDefault?: boolean;
  content?: CompanyWebFooterContent | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWebFooterData {
  companyId: string;
  name: string;
  isDefault?: boolean;
  content?: CompanyWebFooterContent | null;
}

export interface UpdateWebFooterData {
  name?: string;
  isDefault?: boolean;
  content?: CompanyWebFooterContent | null;
}

class CompanyWebFootersService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getFooters(companyId: string): Promise<CompanyWebFooter[]> {
    const response = await fetch(`${API_BASE_URL}/company-web-footers?companyId=${companyId}`, {
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

  async getFooterById(id: string): Promise<CompanyWebFooter> {
    const response = await fetch(`${API_BASE_URL}/company-web-footers/${id}`, {
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

  async getDefaultFooterPublic(companyId: string): Promise<CompanyWebFooter | null> {
    const response = await fetch(`${API_BASE_URL}/company-web-footers/public/${companyId}/default`, {
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

  async createFooter(payload: CreateWebFooterData): Promise<CompanyWebFooter> {
    const response = await fetch(`${API_BASE_URL}/company-web-footers`, {
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

  async updateFooter(id: string, payload: UpdateWebFooterData): Promise<CompanyWebFooter> {
    const response = await fetch(`${API_BASE_URL}/company-web-footers/${id}`, {
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

  async deleteFooter(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/company-web-footers/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const companyWebFootersService = new CompanyWebFootersService();
