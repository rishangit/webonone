import type { LucideIcon } from "lucide-react";

import type { User } from "./user";

/** App theme mode (settings / showcase). */
export type Theme = "light" | "dark" | "system";
export type AccentColor = "orange" | "red" | "green" | "blue" | "yellow";

export interface NavigationItem {
  icon: LucideIcon;
  label: string;
  id: string;
}

export interface PageProps {
  currentUser?: User | null;
}

export interface DetailPageProps extends PageProps {
  onBack: () => void;
}

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
