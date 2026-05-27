import { FolderOpen, File, HardDrive } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LIST_CARD_LIST_SHELL } from "@/components/common/CardKebabTrigger";
import {
  ListCardContent,
  ListCardCoverImage,
  ListCardDetailDivider,
  ListCardDetailField,
  ListCardDetailGrid,
  ListCardDetailsHeader,
  ListCardMediaColumn,
} from "@/components/common/ListCardLayout";
import { getMediaFileUrl } from "@/features/website/services/companyWebMedia";
import type { MediaItem } from "./MediaActions";
import { MediaActions } from "./MediaActions";

export interface MediaListViewProps {
  item: MediaItem;
  companyId: string;
  formatSize: (bytes: number) => string;
  onOpen: (path: string) => void;
  onDelete: (path: string, name: string, type: "file" | "folder") => void;
  previewImageUrl?: string;
}

export const MediaListView = ({
  item,
  companyId,
  formatSize,
  onOpen,
  onDelete,
  previewImageUrl,
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
  const subtitle = item.type === "file" ? formatSize(item.size) : "Folder";
  const fileExtension =
    !isFolder && item.name.includes(".") ? item.name.split(".").pop() ?? "—" : "—";
  const imageSrc =
    !isFolder && item.isImage
      ? previewImageUrl ?? getMediaFileUrl(companyId, item.path)
      : undefined;

  return (
    <Card className={LIST_CARD_LIST_SHELL} onClick={handleRowClick}>
      <ListCardMediaColumn>
        {imageSrc ? (
          <ListCardCoverImage src={imageSrc} alt={item.name} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10">
            {isFolder ? (
              <FolderOpen className="h-10 w-10 text-[var(--accent-primary)]" />
            ) : (
              <File className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
        )}
      </ListCardMediaColumn>

      <ListCardContent>
        <ListCardDetailsHeader
          title={item.name}
          description={subtitle}
          actions={
            <MediaActions
              item={item}
              onOpen={isFolder ? onOpen : undefined}
              onDelete={onDelete}
            />
          }
        />
        <ListCardDetailGrid>
          <ListCardDetailField label="Type" value={isFolder ? "Folder" : "File"} />
          <ListCardDetailField icon={HardDrive} label="Size" value={subtitle} />
          <ListCardDetailField label="Path" value={item.path} />
        </ListCardDetailGrid>
        <ListCardDetailDivider />
        <ListCardDetailGrid>
          <ListCardDetailField label="Extension" value={fileExtension} />
          <ListCardDetailField label="Image" value={!isFolder && item.isImage ? "Yes" : "No"} />
          <ListCardDetailField
            label="Modified"
            value={!isFolder ? item.modifiedAt : "—"}
          />
        </ListCardDetailGrid>
      </ListCardContent>
    </Card>
  );
};
