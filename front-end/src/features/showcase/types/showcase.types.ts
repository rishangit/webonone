import type { Theme, AccentColor } from "@/shared/types";

export type ShowcaseTabId =
  | "catalog"
  | "primary"
  | "controls"
  | "cards"
  | "lists"
  | "dialogs";

export type ShowcaseCatalogCategory =
  | "primary"
  | "controls"
  | "cards"
  | "lists"
  | "dialogs"
  | "common";

export interface ShowcaseCatalogEntry {
  id: string;
  name: string;
  category: ShowcaseCatalogCategory;
  importPath: string;
  tab: ShowcaseTabId;
  sectionId?: string;
  notes?: string;
}

export interface ShowcaseThemeProps {
  onThemeChange?: (theme: Theme) => void;
  currentTheme?: Theme;
  onAccentColorChange?: (accentColor: AccentColor) => void;
  currentAccentColor?: AccentColor;
}

export interface ShowcasePageProps extends ShowcaseThemeProps {}

export interface ShowcaseTabProps {
  onNavigateTab?: (tab: ShowcaseTabId, sectionId?: string) => void;
}

export interface ShowcasePrimaryTabProps extends ShowcaseTabProps, ShowcaseThemeProps {}

export interface ShowcaseSectionProps {
  sectionId: string;
  viewMode: "grid" | "list";
}
