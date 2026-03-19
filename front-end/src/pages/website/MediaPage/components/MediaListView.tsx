import { Card } from "../../../../components/ui/card";
import { FolderOpen, File } from "lucide-react";
import { getMediaFileUrl } from "../../../../services/companyWebMedia";
import type { MediaItem } from "./MediaActions";
import { MediaActions } from "./MediaActions";

export interface MediaListViewProps {
  item: MediaItem;
  companyId: string;
  formatSize: (bytes: number) => string;
  onOpen: (path: string) => void;
  onDelete: (path: string, name: string, type: "file" | "folder") => void;
}

export const MediaListView = ({
  item,
  companyId,
  formatSize,
  onOpen,
  onDelete,
}: MediaListViewProps) => {
  const handleRowClick = (e: React.MouseEvent) => {
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
      className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 cursor-pointer"
      onClick={handleRowClick}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-lg border border-[var(--glass-border)] flex items-center justify-center overflow-hidden ${
            isFolder
              ? "bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10"
              : "bg-[var(--glass-bg)]"
          }`}
        >
          {isFolder ? (
            <FolderOpen className="w-6 h-6 text-[var(--accent-primary)]" />
          ) : item.type === "file" && item.isImage ? (
            <img
              src={getMediaFileUrl(companyId, item.path)}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <File className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <MediaActions
                item={item}
                onOpen={isFolder ? onOpen : undefined}
                onDelete={onDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
