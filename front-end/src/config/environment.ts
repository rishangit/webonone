// Environment configuration for the frontend application

interface EnvironmentConfig {
  apiBaseUrl: string;
  apiUrl: string;
  appName: string;
  appVersion: string;
  appDescription: string;
  devMode: boolean;
  debugMode: boolean;
  enableAnalytics: boolean;
  enableDebugTools: boolean;
  enableMockData: boolean;
  googleMapsApiKey?: string;
  stripePublishableKey?: string;
  sentryDsn?: string;
}

// Get environment variables with fallbacks
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return import.meta.env[key] || defaultValue;
};

// Environment configuration
export const config: EnvironmentConfig = {
  // API Configuration
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:5007/api'),
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:5007'),
  
  // Application Configuration
  appName: getEnvVar('VITE_APP_NAME', 'AppointmentPro'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  appDescription: getEnvVar('VITE_APP_DESCRIPTION', 'Full-stack appointment booking application'),
  
  // Development Configuration
  devMode: getEnvVar('VITE_DEV_MODE', 'true') === 'true',
  debugMode: getEnvVar('VITE_DEBUG_MODE', 'false') === 'true',
  
  // Feature Flags
  enableAnalytics: getEnvVar('VITE_ENABLE_ANALYTICS', 'false') === 'true',
  enableDebugTools: getEnvVar('VITE_ENABLE_DEBUG_TOOLS', 'true') === 'true',
  enableMockData: getEnvVar('VITE_ENABLE_MOCK_DATA', 'false') === 'true',
  
  // External Services
  googleMapsApiKey: getEnvVar('VITE_GOOGLE_MAPS_API_KEY'),
  stripePublishableKey: getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY'),
  sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
};

// API endpoints
export const apiEndpoints = {
  auth: {
    login: `${config.apiBaseUrl}/auth/login`,
    register: `${config.apiBaseUrl}/auth/register`,
    logout: `${config.apiBaseUrl}/auth/logout`,
    me: `${config.apiBaseUrl}/auth/me`,
    refresh: `${config.apiBaseUrl}/auth/refresh`,
    verify: `${config.apiBaseUrl}/auth/verify`,
    impersonate: (userId: string) => `${config.apiBaseUrl}/auth/impersonate/${userId}`,
    impersonateComplete: (userId: string) => `${config.apiBaseUrl}/auth/impersonate/${userId}/complete`,
  },
  users: {
    list: `${config.apiBaseUrl}/users`,
    profile: (id: string) => `${config.apiBaseUrl}/users/${id}`,
    stats: `${config.apiBaseUrl}/users/stats/overview`,
  },
  appointments: {
    list: `${config.apiBaseUrl}/appointments`,
    create: `${config.apiBaseUrl}/appointments`,
    update: (id: string) => `${config.apiBaseUrl}/appointments/${id}`,
    delete: (id: string) => `${config.apiBaseUrl}/appointments/${id}`,
    stats: `${config.apiBaseUrl}/appointments/stats/overview`,
  },
  services: {
    list: `${config.apiBaseUrl}/services`,
    create: `${config.apiBaseUrl}/services`,
    update: (id: string) => `${config.apiBaseUrl}/services/${id}`,
    delete: (id: string) => `${config.apiBaseUrl}/services/${id}`,
    search: (term: string) => `${config.apiBaseUrl}/services/search/${term}`,
  },
  categories: {
    list: `${config.apiBaseUrl}/categories`,
    active: `${config.apiBaseUrl}/categories/active`,
    create: `${config.apiBaseUrl}/categories`,
    update: (id: string) => `${config.apiBaseUrl}/categories/${id}`,
    delete: (id: string) => `${config.apiBaseUrl}/categories/${id}`,
  },
  currencies: {
    list: `${config.apiBaseUrl}/currencies`,
    create: `${config.apiBaseUrl}/currencies`,
    get: (id: string) => `${config.apiBaseUrl}/currencies/${id}`,
  },
  health: `${config.apiUrl}/health`,
};

// Development utilities
export const isDevelopment = config.devMode;
export const isProduction = !config.devMode;
export const isDebugMode = config.debugMode;

// Logging utility
export const log = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment || isDebugMode) {
      console.log(`[${config.appName}] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[${config.appName}] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment || isDebugMode) {
      console.warn(`[${config.appName}] ${message}`, ...args);
    }
  },
  debug: (message: string, ...args: any[]) => {
    if (isDebugMode) {
      console.debug(`[${config.appName}] ${message}`, ...args);
    }
  },
};

export default config;





