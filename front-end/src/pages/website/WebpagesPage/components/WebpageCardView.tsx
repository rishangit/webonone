import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { WebpageViewProps } from "../types";
import { WebpageActions } from "./WebpageActions";

export const WebpageCardView = ({
  webPage,
  onEdit,
  onBrowse,
  onDelete,
}: WebpageViewProps) => {
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest('[role="menuitem"]') ||
      target.closest("[data-radix-popper-content-wrapper]")
    ) {
      return;
    }
    onBrowse(webPage);
  };

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
                <Globe className="w-4 h-4 text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-lg font-semibold text-foreground truncate">
                {webPage.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 mb-2">
              {webPage.isActive && (
                <Badge
                  className="bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] px-2 py-0.5 text-xs font-semibold"
                >
                  Active
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground break-all line-clamp-2">
              {webPage.url}
            </p>
          </div>
          <WebpageActions
            webPage={webPage}
            onEdit={onEdit}
            onBrowse={onBrowse}
            onDelete={onDelete}
          />
        </div>
      </div>
    </Card>
  );
};
