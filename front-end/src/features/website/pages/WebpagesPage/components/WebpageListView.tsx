import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { WebpageViewProps } from "../types";
import { WebpageActions } from "./WebpageActions";

export const WebpageListView = ({
  webPage,
  onEdit,
  onBrowse,
  onDelete,
}: WebpageViewProps) => {
  const handleRowClick = (e: React.MouseEvent) => {
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
      className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 cursor-pointer"
      onClick={handleRowClick}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 p-3 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10">
          <Globe className="w-6 h-6 text-[var(--accent-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <h3 className="font-semibold text-foreground">{webPage.name}</h3>
              <p className="text-sm text-muted-foreground break-all line-clamp-1 mt-0.5">
                {webPage.url}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {webPage.isActive && (
                <Badge
                  className="bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] px-2 py-0.5 text-xs font-semibold"
                >
                  Active
                </Badge>
              )}
              <WebpageActions
                webPage={webPage}
                onEdit={onEdit}
                onBrowse={onBrowse}
                onDelete={onDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
