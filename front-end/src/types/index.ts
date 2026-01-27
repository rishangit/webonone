// Re-export User type from user.ts to maintain consistency
export { User, UserRole, UserRoleNames } from './user';

// Theme types
export type Theme = "light" | "dark" | "system";
export type AccentColor = "orange" | "red" | "green" | "blue" | "yellow";

// Navigation types
export interface NavigationItem {
  icon: any;
  label: string;
  id: string;
}

// Common API types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Page props interfaces
export interface PageProps {
  currentUser?: User | null;
}

export interface DetailPageProps extends PageProps {
  onBack: () => void;
}

// State management types
export interface AppState {
  isAuthenticated: boolean;
  currentUser: User | null;
  currentPage: string;
  sidebarOpen: boolean;
  theme: Theme;
  accentColor: AccentColor;
  isLoading: boolean;
  showSignUp: boolean;
}