// API service for making HTTP requests
class ApiService {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:5007/api') {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Clone response for error handling (response can only be read once)
      const responseClone = response.clone();
      
      if (!response.ok) {
        // Try to parse error response
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorData: any = {};
        try {
          errorData = await responseClone.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use default error message
        }
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).response = errorData;
        throw error;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Expose baseURL and getToken for other services
  getBaseURL(): string {
    return this.baseURL;
  }

  getAuthToken(): string | null {
    return this.getToken();
  }
}

export const apiService = new ApiService();