import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette } from "lucide-react";
import type { CompanyWebTheme } from "@/services/companyWebThemes";
import { ThemeActions } from "./ThemeActions";

export interface ThemeCardViewProps {
  theme: CompanyWebTheme;
  onEdit: (theme: CompanyWebTheme) => void;
  onSetDefault: (theme: CompanyWebTheme) => void;
  onDelete: (theme: CompanyWebTheme) => void;
}

export const ThemeCardView = ({
  theme,
  onEdit,
  onSetDefault,
  onDelete,
}: ThemeCardViewProps) => {
  const handleCardClick = (e: React.MouseEvent) => {
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

  const basicSetting = theme.themeData?.basicSetting;
  const backgroundColor = basicSetting?.backgroundColor ?? theme.backgroundColor;
  const bodyTextColor = basicSetting?.fontColor ?? theme.bodyTextColor;
  const textStylesCount = theme.themeData?.textSettings?.length ?? 0;
  const subtitle = textStylesCount > 0
    ? `${textStylesCount} text style${textStylesCount !== 1 ? "s" : ""}`
    : "No text styles";

  return (
    <Card
      className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10">
                <Palette className="w-4 h-4 text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-lg font-semibold text-foreground truncate">
                {theme.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 mb-2">
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
            </div>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <ThemeActions
            theme={theme}
            onEdit={onEdit}
            onSetDefault={onSetDefault}
            onDelete={onDelete}
          />
        </div>
        <div
          className="p-3 rounded-lg border border-[var(--glass-border)]"
          style={{
            backgroundColor: backgroundColor || "var(--card)",
            color: bodyTextColor || "inherit",
          }}
        >
          <p className="text-xs">Preview</p>
        </div>
      </div>
    </Card>
  );
};
