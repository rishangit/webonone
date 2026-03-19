import type { CompanyWebTheme } from "../../../../services/companyWebThemes";
import { ThemeListView } from "./ThemeListView";
import { ThemeCardView } from "./ThemeCardView";

export interface ThemeCardProps {
  theme: CompanyWebTheme;
  viewMode: "grid" | "list";
  onView: (theme: CompanyWebTheme) => void;
  onEdit: (theme: CompanyWebTheme) => void;
  onDelete: (theme: CompanyWebTheme) => void;
  onSetDefault: (theme: CompanyWebTheme) => void;
}

export const ThemeCard = ({
  theme,
  viewMode,
  onView,
  onEdit,
  onDelete,
  onSetDefault,
}: ThemeCardProps) => {
  if (viewMode === "grid") {
    return (
      <ThemeCardView
        theme={theme}
        onView={onView}
        onEdit={onEdit}
        onSetDefault={onSetDefault}
        onDelete={onDelete}
      />
    );
  }
  return (
    <ThemeListView
      theme={theme}
      onView={onView}
      onEdit={onEdit}
      onSetDefault={onSetDefault}
      onDelete={onDelete}
    />
  );
};
