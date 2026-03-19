import type { MediaItem } from "./MediaActions";
import { MediaListView } from "./MediaListView";
import { MediaCardView } from "./MediaCardView";

export interface MediaCardProps {
  item: MediaItem;
  companyId: string;
  viewMode: "grid" | "list";
  formatSize: (bytes: number) => string;
  onOpen: (path: string) => void;
  onDelete: (path: string, name: string, type: "file" | "folder") => void;
}

export const MediaCard = ({
  item,
  companyId,
  viewMode,
  formatSize,
  onOpen,
  onDelete,
}: MediaCardProps) => {
  if (viewMode === "grid") {
    return (
      <MediaCardView
        item={item}
        companyId={companyId}
        formatSize={formatSize}
        onOpen={onOpen}
        onDelete={onDelete}
      />
    );
  }
  return (
    <MediaListView
      item={item}
      companyId={companyId}
      formatSize={formatSize}
      onOpen={onOpen}
      onDelete={onDelete}
    />
  );
};
