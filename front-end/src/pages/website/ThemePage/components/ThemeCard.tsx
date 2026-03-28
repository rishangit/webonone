import type { CompanyWebTheme } from "@/services/companyWebThemes";
import { ThemeListView } from "./ThemeListView";
import { ThemeCardView } from "./ThemeCardView";

export interface ThemeCardProps {
  theme: CompanyWebTheme;
  viewMode: "grid" | "list";
  onEdit: (theme: CompanyWebTheme) => void;
  onDelete: (theme: CompanyWebTheme) => void;
  onSetDefault: (theme: CompanyWebTheme) => void;
}

export const ThemeCard = ({
  theme,
  viewMode,
  onEdit,
  onDelete,
  onSetDefault,
}: ThemeCardProps) => {
  if (viewMode === "grid") {
    return (
      <ThemeCardView
        theme={theme}
        onEdit={onEdit}
        onSetDefault={onSetDefault}
        onDelete={onDelete}
      />
    );
  }
  return (
    <ThemeListView
      theme={theme}
      onEdit={onEdit}
      onSetDefault={onSetDefault}
      onDelete={onDelete}
    />
  );
};
