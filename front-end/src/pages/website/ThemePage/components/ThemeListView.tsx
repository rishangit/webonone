import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette } from "lucide-react";
import type { CompanyWebTheme } from "@/services/companyWebThemes";
import { ThemeActions } from "./ThemeActions";

export interface ThemeListViewProps {
  theme: CompanyWebTheme;
  onEdit: (theme: CompanyWebTheme) => void;
  onSetDefault: (theme: CompanyWebTheme) => void;
  onDelete: (theme: CompanyWebTheme) => void;
}

export const ThemeListView = ({
  theme,
  onEdit,
  onSetDefault,
  onDelete,
}: ThemeListViewProps) => {
  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest('[role="menuitem"]') ||
      target.closest("[data-radix-popper-content-wrapper]")
    ) {
      return;
    }
    onEdit(theme);
  };

  const textStylesCount = theme.themeData?.textSettings?.length ?? 0;
  const subtitle = textStylesCount > 0
    ? `${textStylesCount} text style${textStylesCount !== 1 ? "s" : ""}`
    : "No text styles";

  return (
    <Card
      className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 cursor-pointer"
      onClick={handleRowClick}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 p-3 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10">
          <Palette className="w-6 h-6 text-[var(--accent-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <h3 className="font-semibold text-foreground">{theme.name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {theme.isDefault && (
                <Badge
                  className="bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] px-2 py-0.5 text-xs font-semibold"
                >
                  Default
                </Badge>
              )}
              {theme.isActive && (
                <Badge
                  className="bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] px-2 py-0.5 text-xs font-semibold"
                >
                  Active
                </Badge>
              )}
              <ThemeActions
                theme={theme}
                onEdit={onEdit}
                onSetDefault={onSetDefault}
                onDelete={onDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
