

// Export all services
export { authService } from './auth';
export { apiService } from './api';
export { database } from './database';

// For compatibility, also export simplified API service
export const api = {
  get: async (endpoint: string) => {
    // Mock API calls
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: [], message: 'Success' };
  },
  
  post: async (endpoint: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: data, message: 'Created successfully' };
  },
  
  put: async (endpoint: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: data, message: 'Updated successfully' };
  },
  
  delete: async (endpoint: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Deleted successfully' };
  }
};