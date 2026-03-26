import { FolderOpen, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type MediaItemFolder = { type: "folder"; name: string; path: string };
export type MediaItemFile = {
  type: "file";
  name: string;
  path: string;
  size: number;
  isImage: boolean;
  modifiedAt: string;
};
export type MediaItem = MediaItemFolder | MediaItemFile;

export interface MediaActionsProps {
  item: MediaItem;
  onOpen?: (path: string) => void;
  onDelete: (path: string, name: string, type: "file" | "folder") => void;
}

export const MediaActions = ({
  item,
  onOpen,
  onDelete,
}: MediaActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-[var(--accent-bg)] text-muted-foreground hover:text-[var(--accent-text)] flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-popover border-border"
        align="end"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "folder" && onOpen && (
          <DropdownMenuItem onClick={() => onOpen(item.path)}>
            <FolderOpen className="w-4 h-4 mr-2" />
            Open
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onDelete(item.path, item.name, item.type)}
          className="text-red-500 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
