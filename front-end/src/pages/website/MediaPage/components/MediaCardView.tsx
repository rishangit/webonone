import { Card } from "@/components/ui/card";
import { FolderOpen, File } from "lucide-react";
import { getMediaFileUrl } from "@/services/companyWebMedia";
import type { MediaItem } from "./MediaActions";
import { MediaActions } from "./MediaActions";

export interface MediaCardViewProps {
  item: MediaItem;
  companyId: string;
  formatSize: (bytes: number) => string;
  onOpen: (path: string) => void;
  onDelete: (path: string, name: string, type: "file" | "folder") => void;
}

export const MediaCardView = ({
  item,
  companyId,
  formatSize,
  onOpen,
  onDelete,
}: MediaCardViewProps) => {
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest('[role="menuitem"]') ||
      target.closest("[data-radix-popper-content-wrapper]")
    ) {
      return;
    }
    if (item.type === "folder") onOpen(item.path);
  };

  const isFolder = item.type === "folder";
  const subtitle =
    item.type === "file"
      ? formatSize(item.size)
      : "Folder";

  return (
    <Card
      className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="aspect-square w-full max-w-[140px] mx-auto rounded-lg border border-[var(--glass-border)] overflow-hidden bg-[var(--glass-bg)] flex items-center justify-center">
              {isFolder ? (
                <FolderOpen className="w-12 h-12 text-[var(--accent-primary)]" />
              ) : item.type === "file" && item.isImage ? (
                <img
                  src={getMediaFileUrl(companyId, item.path)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <File className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <div className="mt-3 text-center">
              <h3 className="text-sm font-semibold text-foreground truncate px-1">
                {item.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
          </div>
          <MediaActions
            item={item}
            onOpen={isFolder ? onOpen : undefined}
            onDelete={onDelete}
          />
        </div>
      </div>
    </Card>
  );
};
